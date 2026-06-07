const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'

class RateLimiter {
  private calls: number[] = []
  private maxPerMinute: number

  constructor(maxPerMinute = 10) {
    this.maxPerMinute = maxPerMinute
  }

  private prune(): void {
    const now = Date.now()
    this.calls = this.calls.filter(t => now - t < 60000)
  }

  canCall(): boolean {
    this.prune()
    return this.calls.length < this.maxPerMinute
  }

  remaining(): number {
    this.prune()
    return Math.max(0, this.maxPerMinute - this.calls.length)
  }

  waitTime(): number {
    this.prune()
    if (this.calls.length < this.maxPerMinute) return 0
    const oldest = this.calls[0]
    return Math.max(0, 60000 - (Date.now() - oldest))
  }

  record(): void {
    this.calls.push(Date.now())
  }
}

export const rateLimiter = new RateLimiter(10)

export type ContentType = 'markdown' | 'mermaid' | 'plantuml' | 'svg' | 'graphview'

export interface GenerateOptions {
  type: ContentType
  topic: string
  context?: string
  imageData?: string
  provider: 'gemini' | 'ollama'
  apiKey: string
  modelName: string
  ollamaUrl: string
  ollamaModel: string
}

function buildPrompt(type: string, topic: string, context?: string, hasImage?: boolean): string {
  const ctx = context ? ` for a ${context} course` : ''
  const ref = hasImage ? '\n\nUse the attached image as a visual reference. Generate a diagram that matches the structure or concept shown in the image.' : ''
  switch (type) {
    case 'markdown':
      return `Write a detailed study note about "${topic}"${ctx}. Include key concepts, explanations, examples, and relevant equations or code blocks. Format as markdown with headings, bullet points, and code fences where appropriate.${ref}`
    case 'mermaid':
      return `Generate a mermaid.js diagram code for: ${topic}. Return ONLY the raw mermaid code block with triple backticks and the mermaid language tag. No explanation, no surrounding text.${ref}`
    case 'plantuml':
      return `Generate a PlantUML diagram for: ${topic}. Return ONLY the raw PlantUML code with @startuml/@enduml tags. No explanation, no surrounding text.${ref}`
    case 'svg':
      return `Generate an SVG diagram for: ${topic}. Return ONLY valid SVG code inside <svg> tags with viewBox="0 0 400 300". Use colors, shapes, and text elements. No explanation, no surrounding text.${ref}`
    case 'graphview':
      return `Generate a GraphView JSX component for: ${topic}. Return ONLY the <GraphView> JSX tag with type="bar" or type="line" and realistic data array. No explanation, no surrounding text. Format: <GraphView title="..." type="bar" data={[{name:"...",value:123}]} />${ref}`
    default:
      return `Write about: ${topic}${ref}`
  }
}

function postProcess(type: string, raw: string): string {
  let result = raw.trim()
  if (type === 'markdown') return result
  if (type === 'svg') {
    if (!result.startsWith('<svg')) result = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">\n${result}\n</svg>`
    return '```svg\n' + result + '\n```'
  }
  if (type === 'mermaid') {
    if (!result.includes('```')) result = '```mermaid\n' + result + '\n```'
    return result
  }
  if (type === 'plantuml') {
    if (!result.includes('@startuml')) result = '```plantuml\n@startuml\n' + result + '\n@enduml\n```'
    else result = '```plantuml\n' + result + '\n```'
    return result
  }
  if (type === 'graphview') return result
  return result
}

async function callGemini(prompt: string, apiKey: string, modelName: string, imageData?: string): Promise<string> {
  const url = `${GEMINI_ENDPOINT}/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`
  const parts: any[] = [{ text: prompt }]
  if (imageData) {
    const comma = imageData.indexOf(',')
    const mimeType = imageData.slice(5, comma).split(';')[0]
    const data = imageData.slice(comma + 1)
    parts.push({ inlineData: { mimeType, data } })
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`Gemini API error ${res.status}: ${err}`)
  }
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned empty response')
  return text
}

async function fetchWithTimeout(input: RequestInfo, init: RequestInit & { timeout?: number } = {}): Promise<Response> {
  const { timeout = 60000, ...fetchInit } = init
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(input, { ...fetchInit, signal: controller.signal })
    return res
  } finally {
    clearTimeout(id)
  }
}

async function pingOllama(rawUrl: string): Promise<'ok' | 'unreachable' | 'cors'> {
  const pingUrl = `${rawUrl.replace(/\/+$/, '')}/`
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), 3000)
  try {
    const res = await fetch(pingUrl, { method: 'GET', mode: 'no-cors', signal: controller.signal })
    return res.type === 'opaque' || res.ok ? 'ok' : 'unreachable'
  } catch {
    return 'unreachable'
  } finally {
    clearTimeout(id)
  }
}

async function callOllama(prompt: string, url: string, model: string, imageData?: string): Promise<string> {
  const rawUrl = url.replace(/\/+$/, '')

  const onLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  const viaProxy = import.meta.env.DEV && onLocalhost && rawUrl.includes('localhost')
  const endpoint = viaProxy ? `/ollama/api/generate` : `${rawUrl}/api/generate`

  const body: any = { model, prompt, stream: false, options: { temperature: 0.7 } }
  if (imageData) {
    const comma = imageData.indexOf(',')
    const data = imageData.slice(comma + 1)
    body.images = [data]
  }
  let res: Response
  try {
    res = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      timeout: 120000,
    })
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Ollama request timed out (2 min). The model might still be loading or the server is busy.')
    }
    const ping = await pingOllama(rawUrl)
    if (ping === 'ok') {
      throw new Error(
        'Ollama server is running but the browser is blocking the request (CORS). Fix:\n' +
        `  • Stop Ollama: ollama stop\n` +
        `  • Restart with: OLLAMA_ORIGINS=* ollama serve\n` +
        `  • Then pull model: ollama pull ${model}`
      )
    }
    throw new Error(
      'Cannot reach Ollama. Ensure the server is running:\n' +
      `  • Start: ollama serve\n` +
      `  • Pull model: ollama pull ${model}\n` +
      `  • URL: ${rawUrl}\n` +
      `  • Check: curl ${rawUrl}/`
    )
  }
  if (!res.ok) {
    const err = await res.text().catch(() => '')
    if (res.status === 404 && err.includes('model')) {
      throw new Error(`Model "${model}" not found. Run: ollama pull ${model}`)
    }
    throw new Error(`Ollama API error ${res.status}: ${err}`)
  }
  const data = await res.json()
  if (data.response == null) throw new Error('Ollama returned empty response')
  return data.response
}

async function callModel(prompt: string, opts: GenerateOptions): Promise<string> {
  if (opts.provider === 'ollama') {
    return callOllama(prompt, opts.ollamaUrl, opts.ollamaModel, opts.imageData)
  }
  return callGemini(prompt, opts.apiKey, opts.modelName, opts.imageData)
}

export async function generateContent(opts: GenerateOptions): Promise<string> {
  if (!rateLimiter.canCall()) {
    const wait = rateLimiter.waitTime()
    throw new Error(`Rate limit reached. Try again in ${Math.ceil(wait / 1000)} seconds.`)
  }
  const prompt = buildPrompt(opts.type, opts.topic, opts.context, !!opts.imageData)
  rateLimiter.record()
  const raw = await callModel(prompt, opts)
  return postProcess(opts.type, raw)
}
