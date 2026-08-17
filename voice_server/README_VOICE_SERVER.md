# ConverseAI Voice Server — Setup Guide

## Overview
Enterprise self-hosted voice agent pipeline:
- **STT**: Faster-Whisper (Hindi + English + Hinglish)
- **LLM**: Ollama (Google Gemma 2: `gemma2:9b` / `gemma2:2b`)
- **TTS**: CosyVoice2 (Qwen2.5-0.5B backbone) → Edge-TTS fallback
- **VAD**: Silero Voice Activity Detection
- **RAG**: Semantic Vector Search

---

## 🎤 TTS Engine: CosyVoice2 (Qwen2.5-0.5B Human Voice)

CosyVoice2 uses **Qwen2.5-0.5B** as its core language model to generate ultra-realistic human voices in Hindi and English. It runs **fully locally** — no internet required after model download.

### Step 1 — Clone CosyVoice2 inside voice_server/

```bash
cd voice_server/
git clone --recursive https://github.com/FunAudioLLM/CosyVoice.git
cd CosyVoice
git submodule update --init --recursive
```

### Step 2 — Install Dependencies

```bash
# Create a conda environment (recommended)
conda create -n cosyvoice -y python=3.10
conda activate cosyvoice

# Install CosyVoice2 requirements
pip install -r requirements.txt

# Install voice server requirements
pip install -r ../requirements.txt
```

### Step 3 — Download CosyVoice2-0.5B Model Weights

```bash
python -c "
from huggingface_hub import snapshot_download
snapshot_download(
    'FunAudioLLM/CosyVoice2-0.5B',
    local_dir='pretrained_models/CosyVoice2-0.5B'
)
"
```

> **Model size**: ~1.5 GB  
> **GPU required**: NVIDIA GPU with 4GB+ VRAM recommended (CPU works but is slower)

### Step 4 — Set Environment Variables

In `.env` (or your server environment):
```env
TTS_ENGINE=cosyvoice2
COSYVOICE_PATH=./CosyVoice
COSYVOICE_MODEL_DIR=./CosyVoice/pretrained_models/CosyVoice2-0.5B
```

### Step 5 — Run the Voice Server

```bash
python main.py
# or
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Fallback Behavior (No Setup Needed)

If CosyVoice2 is not installed, the server **automatically falls back** to:

| Priority | Engine | Quality | Requires Internet |
|---|---|---|---|
| 1st | **CosyVoice2 (Qwen2.5-0.5B)** | ⭐⭐⭐⭐⭐ Hyper-realistic | ❌ Local |
| 2nd | **Edge-TTS** (hi-IN-SwaraNeural) | ⭐⭐⭐⭐ Neural voice | ✅ Yes |
| 3rd | **pyttsx3** | ⭐⭐ Robotic | ❌ Local |

---

## Available CosyVoice2 Speakers

| Language | Speaker Preset | Description |
|---|---|---|
| Hindi | `中文女` | Natural female voice (Hindi-compatible) |
| English | `English Female` | Native English female voice |

---

## Health Check

```bash
curl http://localhost:8000/health
curl http://localhost:8000/ready
```

---

## Reindex Knowledge Base

```bash
curl -X POST http://localhost:8000/api/reindex \
  -H "X-Admin-Secret-Key: converseai-superadmin-secret-key"
```
