/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_XAI_VOICE_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
