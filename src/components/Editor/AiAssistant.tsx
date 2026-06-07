import { useState, useEffect } from 'react'
import { getAiConfig, saveAiConfig, clearAiConfig, type AiConfig, type AiProvider } from '../../utils/ai-config'
import { generateContent, rateLimiter } from '../../utils/ai'

interface Props {
  onInsert: (code: string) => void
  onClose: () => void
}

const CONTENT_TYPES = [
  { value: 'markdown', label: '📝 Markdown Note' },
  { value: 'mermaid', label: '📊 Mermaid Diagram' },
  { value: 'plantuml', label: '🏗 PlantUML Diagram' },
  { value: 'svg', label: '🎨 SVG Diagram' },
  { value: 'graphview', label: '📈 GraphView Chart' },
] as const

const PROVIDERS: { value: AiProvider; label: string }[] = [
  { value: 'gemini', label: '☁️ Gemini (remote)' },
  { value: 'ollama', label: '🖥 Ollama (local)' },
]

export function AiAssistant({ onInsert, onClose }: Props) {
  const [config, setConfig] = useState<AiConfig>(getAiConfig)
  const [topic, setTopic] = useState('')
  const [context, setContext] = useState('')
  const [type, setType] = useState<string>('markdown')
  const [result, setResult] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyDraft, setApiKeyDraft] = useState(config.apiKey)
  const [ollamaUrlDraft, setOllamaUrlDraft] = useState(config.ollamaUrl)
  const [ollamaModelDraft, setOllamaModelDraft] = useState(config.ollamaModel)

  useEffect(() => {
    setApiKeyDraft(config.apiKey)
    setOllamaUrlDraft(config.ollamaUrl)
    setOllamaModelDraft(config.ollamaModel)
  }, [config.apiKey, config.ollamaUrl, config.ollamaModel])

  const savePartial = (partial: Partial<AiConfig>) => {
    const updated = { ...config, ...partial }
    saveAiConfig(updated)
    setConfig(updated)
  }

  const handleGenerate = async () => {
    if (!topic.trim()) return
    if (config.provider === 'gemini' && !config.apiKey.trim()) {
      setError('Enter a Gemini API key first.')
      return
    }
    setGenerating(true)
    setError('')
    setResult('')
    try {
      const text = await generateContent({
        type: type as any,
        topic: topic.trim(),
        context: context.trim() || undefined,
        provider: config.provider,
        apiKey: config.apiKey,
        modelName: config.modelName,
        ollamaUrl: config.ollamaUrl,
        ollamaModel: config.ollamaModel,
      })
      setResult(text)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  const needsApiKey = config.provider === 'gemini'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          display: 'flex', flexDirection: 'column',
          width: 'min(700px, 94vw)', maxHeight: '92vh',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.6rem 1rem',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg-primary)',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>
            🤖 AI Assistant
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem', lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>MODEL CONFIGURATION</div>

            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Provider:</span>
              {PROVIDERS.map(p => (
                <button
                  key={p.value}
                  onClick={() => savePartial({ provider: p.value })}
                  style={{
                    padding: '0.3em 0.6em', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                    backgroundColor: config.provider === p.value ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: config.provider === p.value ? '#fff' : 'var(--text-primary)',
                    cursor: 'pointer', fontSize: 'var(--font-size-xs)', fontWeight: config.provider === p.value ? 600 : 400,
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {needsApiKey ? (
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyDraft}
                  onChange={e => setApiKeyDraft(e.target.value)}
                  placeholder="Enter Gemini API Key"
                  style={{ flex: 1, minWidth: '120px', padding: '0.35em 0.5em', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}
                />
                <button onClick={() => setShowApiKey(v => !v)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35em 0.5em', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>{showApiKey ? '🙈' : '👁'}</button>
                <button onClick={() => savePartial({ apiKey: apiKeyDraft })} style={{ padding: '0.35em 0.6em', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: 'var(--accent)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-size-xs)' }}>Save</button>
                {config.apiKey && <button onClick={() => { clearAiConfig(); setConfig(getAiConfig()); setApiKeyDraft('') }} style={{ padding: '0.35em 0.6em', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'transparent', color: '#e74c3c', cursor: 'pointer', fontSize: 'var(--font-size-xs)' }}>Clear</button>}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, minWidth: '140px' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>URL:</span>
                  <input
                    value={ollamaUrlDraft}
                    onChange={e => setOllamaUrlDraft(e.target.value)}
                    placeholder="http://localhost:11434"
                    style={{ flex: 1, minWidth: '100px', padding: '0.35em 0.5em', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Model:</span>
                  <input
                    value={ollamaModelDraft}
                    onChange={e => setOllamaModelDraft(e.target.value)}
                    placeholder="llama3.2"
                    style={{ width: '120px', padding: '0.35em 0.5em', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}
                  />
                </div>
                <button onClick={() => savePartial({ ollamaUrl: ollamaUrlDraft, ollamaModel: ollamaModelDraft })} style={{ padding: '0.35em 0.6em', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: 'var(--accent)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-size-xs)' }}>Save</button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
              {needsApiKey && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Model:</span>
                  <input
                    value={config.modelName}
                    onChange={e => savePartial({ modelName: e.target.value })}
                    style={{ padding: '0.2em 0.4em', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', width: '160px' }}
                  />
                </div>
              )}
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.sessionOnly}
                  onChange={e => savePartial({ sessionOnly: e.target.checked })}
                />
                Session-only (cleared on tab close)
              </label>
            </div>

            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {needsApiKey ? (
                <>🔒 Key stored in this browser only. Other sites cannot access it. <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link)' }}>Get a Gemini API key</a></>
              ) : (
                <>🖥 Ensure Ollama is running locally with your model downloaded (<code style={{ fontSize: 'var(--font-size-xs)' }}>ollama pull llama3.2</code>)</>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '200px' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Topic / Description *</label>
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g., Binary Search Tree, HTTP Request Flow"
                style={{ width: '100%', padding: '0.4em 0.5em', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm)' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Content Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                style={{ width: '100%', padding: '0.4em 0.5em', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm)' }}
              >
                {CONTENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Context (optional, e.g., course name)</label>
            <input
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="e.g., Data Structures, Computer Networks"
              style={{ width: '100%', padding: '0.4em 0.5em', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleGenerate}
              disabled={generating || !topic.trim() || (needsApiKey && !config.apiKey.trim())}
              style={{
                padding: '0.4em 1em', borderRadius: 'var(--radius-md)', border: 'none',
                backgroundColor: generating || !topic.trim() || (needsApiKey && !config.apiKey.trim()) ? 'var(--bg-primary)' : 'var(--accent)',
                color: generating || !topic.trim() || (needsApiKey && !config.apiKey.trim()) ? 'var(--text-secondary)' : '#fff',
                cursor: generating || !topic.trim() || (needsApiKey && !config.apiKey.trim()) ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm)', fontWeight: 600,
                opacity: generating || !topic.trim() || (needsApiKey && !config.apiKey.trim()) ? 0.5 : 1,
              }}
            >
              {generating ? '⏳ Generating...' : '⚡ Generate'}
            </button>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Rate: {rateLimiter.remaining()}/10 per min
            </span>
          </div>

          {error && (
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(231,76,60,0.1)', border: '1px solid #e74c3c', fontSize: 'var(--font-size-xs)', color: '#e74c3c' }}>
              {error}
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>RESULT</div>
              <pre style={{
                margin: 0, padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)',
                maxHeight: '300px', overflow: 'auto',
                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)',
                color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {result}
              </pre>
              <button
                onClick={() => { onInsert(result); onClose() }}
                style={{
                  padding: '0.4em 1em', borderRadius: 'var(--radius-md)', border: 'none',
                  backgroundColor: 'var(--accent)', color: '#fff', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm)', fontWeight: 600,
                  alignSelf: 'flex-start',
                }}
              >
                📄 Insert into Editor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
