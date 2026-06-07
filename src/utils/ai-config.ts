const CONFIG_KEY = 'ai_config'

export type AiProvider = 'gemini' | 'ollama'

export interface AiConfig {
  provider: AiProvider
  apiKey: string
  modelName: string
  ollamaUrl: string
  ollamaModel: string
  sessionOnly: boolean
}

const DEFAULT_CONFIG: AiConfig = {
  provider: 'gemini',
  apiKey: '',
  modelName: 'gemini-2.0-flash',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'qwen2.5-vl:7b',
  sessionOnly: false,
}

function getStorage(): Storage {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return localStorage
    const cfg = JSON.parse(raw) as AiConfig
    return cfg.sessionOnly ? sessionStorage : localStorage
  } catch {
    return localStorage
  }
}

export function getAiConfig(): AiConfig {
  try {
    const store = getStorage()
    const raw = store.getItem(CONFIG_KEY)
    if (!raw) return { ...DEFAULT_CONFIG }
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export function saveAiConfig(config: AiConfig): void {
  const store = config.sessionOnly ? sessionStorage : localStorage
  store.setItem(CONFIG_KEY, JSON.stringify(config))
  if (!config.sessionOnly) {
    sessionStorage.removeItem(CONFIG_KEY)
  } else {
    localStorage.removeItem(CONFIG_KEY)
  }
}

export function clearAiConfig(): void {
  localStorage.removeItem(CONFIG_KEY)
  sessionStorage.removeItem(CONFIG_KEY)
}
