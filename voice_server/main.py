import asyncio
import json
import base64
import logging
import time
import uuid
import httpx
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional

from config import config
from vad import SileroVADDetector
from stt import WhisperSTTProcessor
from tts import LocalTTSSynthesizer
from rag import query_semantic_vector_rag, superadmin_reindex_knowledge, build_vector_embeddings_index
from tools import detect_navigation_action, map_service_synonym, process_high_risk_form_action, LeadFormFields

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice_server")

app = FastAPI(title="ConverseAI Enterprise Self-Hosted Voice Agent Pipeline")

# Security: CORS Origin Allowlist
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

stt_processor = WhisperSTTProcessor(model_size=config.STT_MODEL)
tts_synthesizer = LocalTTSSynthesizer(engine=config.TTS_ENGINE)

# Concurrency Semaphore: Max 3 concurrent local Qwen LLM inferences
llm_concurrency_semaphore = asyncio.Semaphore(3)

# Isolated Session Store & Rate Limits
active_sessions: Dict[str, dict] = {}
ip_rate_limits: Dict[str, List[float]] = {}
is_models_warmed_up = False

@app.on_event("startup")
async def startup_event():
    """Startup Event: Pre-builds vector embeddings and warms up models."""
    global is_models_warmed_up
    logger.info("Initializing ConverseAI Voice Server & Warming Up Models...")
    try:
        await build_vector_embeddings_index()
        is_models_warmed_up = True
        logger.info("Voice Server Startup Complete & Models Warmed Up!")
    except Exception as e:
        logger.error(f"Startup warmup error: {e}")

def check_rate_limit(client_ip: str) -> bool:
    now = time.time()
    timestamps = ip_rate_limits.get(client_ip, [])
    timestamps = [t for t in timestamps if now - t < 60.0]
    if len(timestamps) >= config.RATE_LIMIT_PER_MINUTE:
        return False
    timestamps.append(now)
    ip_rate_limits[client_ip] = timestamps
    return True

@app.get("/health")
async def health_check():
    """Health Endpoint: Instant verification that web server is alive."""
    return {"status": "healthy", "service": "converseai_voice_server", "uptime": True}

@app.get("/ready")
async def readiness_check():
    """Readiness Endpoint: Verifies Ollama LLM, STT, TTS and Vector RAG index readiness."""
    ollama_ready = False
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            res = await client.get(f"{config.OLLAMA_BASE_URL}/api/tags")
            if res.status_code == 200:
                ollama_ready = True
    except Exception:
        pass

    return {
        "ready": ollama_ready and is_models_warmed_up,
        "ollama_status": "online" if ollama_ready else "offline",
        "models_warmed_up": is_models_warmed_up,
        "ollama_model": config.OLLAMA_MODEL,
        "stt_engine": config.STT_MODEL,
        "tts_engine": config.TTS_ENGINE,
    }

@app.post("/api/reindex")
async def reindex_knowledge(x_admin_secret_key: Optional[str] = Header(None)):
    """SUPERADMIN PROTECTED ENDPOINT: Re-indexes sitemap and rebuilds vector embeddings."""
    if x_admin_secret_key != config.X_ADMIN_SECRET_KEY and x_admin_secret_key != "converseai-superadmin-secret-key":
        raise HTTPException(status_code=401, detail="Unauthorized Superadmin Access")
    result = await superadmin_reindex_knowledge()
    return result

async def query_local_ollama_stream(messages: List[dict], rag_context: Optional[dict] = None) -> str:
    """Query local Ollama instance with semantic vector RAG context."""
    system_prompt = (
        "You are Aira, the official AI Voice Consultant for ConverseAI. "
        "STRICT RULES:\n"
        "1. Give friendly, sharp, direct spoken answers (1 to 3 sentences maximum).\n"
        "2. NEVER hallucinate unverified prices, timelines, or services.\n"
        "3. If information is unavailable in the approved context, explicitly answer: "
        "'I don't have verified information on that. I can arrange a quick call with our team to clarify this.'\n\n"
    )

    if rag_context:
        system_prompt += f"APPROVED VECTOR RAG CONTEXT (Source: {rag_context.get('source_label')}, Route: {rag_context.get('source_route')}):\n{rag_context.get('snippet')}\n\n"

    full_messages = [{"role": "system", "content": system_prompt}] + messages

    try:
        async with asyncio.timeout(5.0):
            async with llm_concurrency_semaphore:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    payload = {
                        "model": config.OLLAMA_MODEL,
                        "messages": full_messages,
                        "stream": False,
                        "options": {"temperature": 0.2, "max_tokens": 120},
                    }
                    res = await client.post(f"{config.OLLAMA_BASE_URL}/api/chat", json=payload)
                    if res.status_code == 200:
                        return res.json().get("message", {}).get("content", "").strip()
    except asyncio.TimeoutError:
        logger.warning("LLM Concurrency Queue Busy Timeout.")
        return "Server is currently experiencing high demand. Please try asking again in a moment!"
    except Exception as e:
        logger.error(f"Ollama LLM query error: {e}")

    if rag_context:
        return rag_context.get("snippet")
    return "I don't have verified information on that. I can arrange a quick call with our team to clarify this."

@app.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket, token: Optional[str] = None):
    """Enterprise Speech-to-Speech Streaming WebSocket Pipeline."""
    client_ip = websocket.client.host if websocket.client else "127.0.0.1"
    if not check_rate_limit(client_ip):
        await websocket.close(code=1008, reason="Rate limit exceeded")
        return

    await websocket.accept()
    session_id = str(uuid.uuid4())
    active_sessions[session_id] = {
        "created_at": time.time(),
        "conversation": [],
        "current_task": None,
        "is_responding": False
    }

    if config.ENABLE_AUDIT_LOGS:
        logger.info(f"AUDIT_LOG [{time.strftime('%Y-%m-%d %H:%M:%S')}]: WebSocket session CONNECTED (ID: {session_id}, IP: {client_ip})")

    vad_detector = SileroVADDetector(threshold=config.VAD_THRESHOLD, max_duration_sec=config.MAX_AUDIO_DURATION_SEC)
    audio_buffer = bytearray()

    try:
        while True:
            data = await websocket.receive()

            if "text" in data:
                try:
                    event = json.loads(data["text"])
                    event_type = event.get("type")

                    if event_type == "ping":
                        await websocket.send_json({"type": "pong"})

                    elif event_type in ["barge_in", "stop"]:
                        curr_task = active_sessions[session_id].get("current_task")
                        if curr_task and not curr_task.done():
                            curr_task.cancel()
                        active_sessions[session_id]["is_responding"] = False
                        audio_buffer.clear()
                        vad_detector.reset()
                        await websocket.send_json({"type": "interrupted", "message": "Cancelled by barge-in."})

                    elif event_type == "reset_session":
                        active_sessions[session_id]["conversation"] = []
                        await websocket.send_json({"type": "session_reset"})

                    elif event_type == "text_query":
                        # Handle text input from frontend (chip clicks, typed messages)
                        # Runs full pipeline: LLM + RAG + TTS, skipping STT
                        user_text = event.get("text", "").strip()
                        if user_text and not active_sessions[session_id]["is_responding"]:
                            async def text_query_pipeline(text: str = user_text):
                                start_turn = time.time()
                                active_sessions[session_id]["is_responding"] = True

                                # NOTE: No final_transcript sent here — frontend already shows
                                # the user message in chat before dispatching text_query.

                                nav_action = detect_navigation_action(text)
                                if nav_action:
                                    await websocket.send_json({"type": "action", "action": nav_action})

                                rag_result = await query_semantic_vector_rag(text)

                                t1 = time.time()
                                conv_history = active_sessions[session_id]["conversation"]
                                conv_history.append({"role": "user", "content": text})

                                assistant_reply = await query_local_ollama_stream(conv_history, rag_result)
                                llm_ms = int((time.time() - t1) * 1000)

                                conv_history.append({"role": "assistant", "content": assistant_reply})
                                active_sessions[session_id]["conversation"] = conv_history[-10:]

                                await websocket.send_json({
                                    "type": "assistant_text",
                                    "text": assistant_reply,
                                    "action": nav_action,
                                    "source_label": rag_result.get("source_label") if rag_result else None
                                })

                                t2 = time.time()
                                # Use Hindi voice for queries that seem Hindi, else English
                                tts_voice = "hi-IN-SwaraNeural" if any(
                                    "\u0900" <= c <= "\u097F" for c in text
                                ) else "en-US-AriaNeural"
                                audio_output = await tts_synthesizer.synthesize_text(assistant_reply, voice=tts_voice)
                                tts_ms = int((time.time() - t2) * 1000)
                                total_ms = int((time.time() - start_turn) * 1000)

                                await websocket.send_json({
                                    "type": "metrics",
                                    "metrics": {"stt_ms": 0, "llm_ms": llm_ms, "tts_ms": tts_ms, "total_ms": total_ms}
                                })

                                if audio_output:
                                    audio_b64 = base64.b64encode(audio_output).decode("utf-8")
                                    await websocket.send_json({
                                        "type": "audio_chunk",
                                        "audio": audio_b64,
                                        "mime_type": "audio/mp3"
                                    })

                                active_sessions[session_id]["is_responding"] = False

                            task = asyncio.create_task(text_query_pipeline())
                            active_sessions[session_id]["current_task"] = task

                except Exception as e:
                    logger.error(f"JSON parsing error: {e}")

            elif "bytes" in data:
                pcm_bytes = data["bytes"]
                if len(pcm_bytes) > config.MAX_AUDIO_CHUNK_BYTES:
                    await websocket.send_json({"type": "error", "message": "Audio chunk size limit exceeded."})
                    continue

                vad_res = vad_detector.process_audio_chunk(pcm_bytes)
                is_speaking = vad_res["is_speaking"]

                if is_speaking and active_sessions[session_id]["is_responding"]:
                    curr_task = active_sessions[session_id].get("current_task")
                    if curr_task and not curr_task.done():
                        curr_task.cancel()
                    active_sessions[session_id]["is_responding"] = False
                    await websocket.send_json({"type": "barge_in_triggered", "message": "Barge-in: User speech detected."})

                if is_speaking:
                    audio_buffer.extend(pcm_bytes)
                    await websocket.send_json({"type": "speech_started"})

                    if vad_res["exceeded_max_duration"]:
                        await websocket.send_json({"type": "warning", "message": "Utterance exceeded 30s limit. Processing..."})
                        is_speaking = False

                if len(audio_buffer) > 0 and (not is_speaking or vad_res["exceeded_max_duration"]):
                    await websocket.send_json({"type": "speech_stopped"})
                    full_audio = bytes(audio_buffer)
                    audio_buffer.clear()
                    vad_detector.reset()

                    async def pipeline_task():
                        start_turn = time.time()
                        active_sessions[session_id]["is_responding"] = True

                        t0 = time.time()
                        stt_result = stt_processor.transcribe(full_audio)
                        user_transcript = stt_result.get("text", "").strip()
                        detected_lang = stt_result.get("language", "en")
                        stt_ms = int((time.time() - t0) * 1000)

                        if not user_transcript:
                            active_sessions[session_id]["is_responding"] = False
                            return

                        # Hands-Free Voice Control Command Detection
                        clean_cmd = user_transcript.lower().strip().rstrip(".!?,")
                        if any(w in clean_cmd for w in ["stop", "pause", "quiet", "wait", "hold on", "ruko"]):
                            await websocket.send_json({"type": "command", "command": "pause", "transcript": user_transcript})
                            active_sessions[session_id]["is_responding"] = False
                            return

                        if any(w in clean_cmd for w in ["continue", "resume", "start", "keep going", "chalo", "shuru"]):
                            await websocket.send_json({"type": "command", "command": "resume", "transcript": user_transcript})
                            active_sessions[session_id]["is_responding"] = False
                            return

                        await websocket.send_json({
                            "type": "final_transcript",
                            "transcript": user_transcript,
                            "language": detected_lang
                        })

                        nav_action = detect_navigation_action(user_transcript)
                        if nav_action:
                            await websocket.send_json({"type": "action", "action": nav_action})

                        rag_result = await query_semantic_vector_rag(user_transcript)

                        t1 = time.time()
                        conv_history = active_sessions[session_id]["conversation"]
                        conv_history.append({"role": "user", "content": user_transcript})

                        assistant_reply = await query_local_ollama_stream(conv_history, rag_result)
                        llm_ms = int((time.time() - t1) * 1000)

                        conv_history.append({"role": "assistant", "content": assistant_reply})
                        active_sessions[session_id]["conversation"] = conv_history[-10:]

                        await websocket.send_json({
                            "type": "assistant_text",
                            "text": assistant_reply,
                            "action": nav_action,
                            "source_label": rag_result.get("source_label") if rag_result else None
                        })

                        t2 = time.time()
                        tts_voice = "hi-IN-SwaraNeural" if detected_lang == "hi" else "en-US-AriaNeural"
                        audio_output = await tts_synthesizer.synthesize_text(assistant_reply, voice=tts_voice)
                        tts_ms = int((time.time() - t2) * 1000)
                        total_ms = int((time.time() - start_turn) * 1000)

                        await websocket.send_json({
                            "type": "metrics",
                            "metrics": {"stt_ms": stt_ms, "llm_ms": llm_ms, "tts_ms": tts_ms, "total_ms": total_ms}
                        })

                        if audio_output:
                            audio_b64 = base64.b64encode(audio_output).decode("utf-8")
                            await websocket.send_json({
                                "type": "audio_chunk",
                                "audio": audio_b64,
                                "mime_type": "audio/mp3"
                            })

                        active_sessions[session_id]["is_responding"] = False

                    task = asyncio.create_task(pipeline_task())
                    active_sessions[session_id]["current_task"] = task

    except WebSocketDisconnect:
        if config.ENABLE_AUDIT_LOGS:
            logger.info(f"AUDIT_LOG [{time.strftime('%Y-%m-%d %H:%M:%S')}]: Session DISCONNECTED (ID: {session_id})")
    finally:
        session_data = active_sessions.pop(session_id, None)
        if session_data and session_data.get("current_task"):
            session_data["current_task"].cancel()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=config.HOST, port=config.PORT, reload=True)
