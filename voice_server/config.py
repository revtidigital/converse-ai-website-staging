import os

class Config:
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen2.5:7b")
    STT_MODEL: str = os.getenv("STT_MODEL", "base")
    TTS_ENGINE: str = os.getenv("TTS_ENGINE", "cosyvoice2") # Primary Choice: CosyVoice2 (Qwen2.5-0.5B backbone) — Ultra-realistic local human voice (Edge-TTS neural fallback)
    
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:8080,http://localhost:3000,http://127.0.0.1:8080,http://127.0.0.1:5173").split(",")
    API_SECRET_TOKEN: str = os.getenv("API_SECRET_TOKEN", "converseai-local-secret-key")
    X_ADMIN_SECRET_KEY: str = os.getenv("X_ADMIN_SECRET_KEY", "converseai-superadmin-secret-key")
    
    # Audio Protocol & Security Limits
    MAX_AUDIO_CHUNK_BYTES: int = int(os.getenv("MAX_AUDIO_CHUNK_BYTES", "1048576")) # 1MB limit
    MAX_AUDIO_DURATION_SEC: int = int(os.getenv("MAX_AUDIO_DURATION_SEC", "30"))    # 30s per utterance limit
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))       # 60 requests/min
    VAD_THRESHOLD: float = float(os.getenv("VAD_THRESHOLD", "0.5"))
    SESSION_TTL_SEC: int = int(os.getenv("SESSION_TTL_SEC", "900"))                 # 15 minutes TTL
    
    # Vector RAG & Privacy Controls
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    ENABLE_AUDIT_LOGS: bool = os.getenv("ENABLE_AUDIT_LOGS", "true").lower() == "true"
    SAVE_AUDIO_TO_DISK: bool = os.getenv("SAVE_AUDIO_TO_DISK", "false").lower() == "true" # Privacy: Off by default

config = Config()
