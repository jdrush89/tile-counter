/// <reference types="vite/client" />

declare global {
  const GITHUB_RUNTIME_PERMANENT_NAME: string
  const BASE_KV_SERVICE_URL: string
  const spark: {
    llmPrompt: (strings: string[], ...values: any[]) => string
    llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>
    user: () => Promise<{
      avatarUrl: string
      email: string
      id: string
      isOwner: boolean
      login: string
    }>
    kv: {
      keys: () => Promise<string[]>
      get: <T>(key: string) => Promise<T | undefined>
      set: <T>(key: string, value: T) => Promise<void>
      delete: (key: string) => Promise<void>
    }
  }
}

export {}
