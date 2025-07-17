/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOWA_API_URL: string
  readonly VITE_GOWA_API_KEY: string
  readonly VITE_GOWA_BASIC_AUTH_USER: string
  readonly VITE_GOWA_BASIC_AUTH_PASS: string
  readonly VITE_APP_ENV: string
  readonly VITE_APP_DEBUG: string
  readonly VITE_GOWA_WS_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
