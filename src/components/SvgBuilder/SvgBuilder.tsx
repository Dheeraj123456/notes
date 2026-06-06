import { useState, useCallback, useRef, useEffect } from 'react'

interface Props {
  onInsert: (code: string) => void
  onClose: () => void
}

export function SvgBuilder({ onInsert, onClose }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [svgContent, setSvgContent] = useState('')
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')

  const drawIoUrl = 'https://embed.diagrams.net/?embed=1&ui=min&spin=1&proto=json'

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (!e.data || typeof e.data !== 'string') return
      try {
        const msg = JSON.parse(e.data)
        if (msg.event === 'init') {
          iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ action: 'load', autosave: 1 }), '*')
        }
        if (msg.event === 'export') {
          const svg = typeof msg.data === 'string' ? msg.data : (msg.data?.svg ?? msg.data ?? '')
          setSvgContent(svg)
          setMode('preview')
        }
      } catch {
        // not a draw.io message
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleExport = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ action: 'export', format: 'svg' }), '*')
  }, [])

  const trimmedSvg = svgContent.trim()

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
          width: '95vw', maxWidth: '1200px', height: '92vh',
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
            padding: '0.5rem 1rem',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg-primary)',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>
            draw.io Diagram Editor
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {mode === 'edit' && (
              <button onClick={handleExport} style={{
                padding: '0.4em 1em', borderRadius: 'var(--radius-md)', border: 'none',
                backgroundColor: 'var(--accent)', color: '#fff', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm)', fontWeight: 600,
              }}>
                Export SVG
              </button>
            )}
            {mode === 'preview' && trimmedSvg && (
              <button
                onClick={() => {
                  onInsert('```svg\n' + trimmedSvg + '\n```')
                  onClose()
                }}
                style={{
                  padding: '0.4em 1em', borderRadius: 'var(--radius-md)', border: 'none',
                  backgroundColor: 'var(--accent)', color: '#fff', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm)', fontWeight: 600,
                }}
              >
                Insert SVG
              </button>
            )}
            {mode === 'preview' && (
              <button onClick={() => setMode('edit')} style={{
                padding: '0.4em 0.8em', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)', backgroundColor: 'transparent',
                color: 'var(--text-primary)', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm)',
              }}>
                Back to Editor
              </button>
            )}
            <button onClick={onClose} style={{
              padding: '0.4em 0.8em', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)', backgroundColor: 'transparent',
              color: 'var(--text-primary)', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm)',
            }}>
              Cancel
            </button>
          </div>
        </div>

        {mode === 'edit' ? (
          <iframe
            ref={iframeRef}
            src={drawIoUrl}
            style={{ flex: 1, border: 'none', backgroundColor: '#fff' }}
            title="draw.io Diagram Editor"
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '1rem', alignItems: 'center' }}>
            <div
              className="svg-block"
              dangerouslySetInnerHTML={{ __html: trimmedSvg }}
              style={{ maxWidth: '100%', marginBottom: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: '#fff' }}
            />
            <textarea
              readOnly
              value={trimmedSvg}
              rows={8}
              style={{
                width: '100%', maxWidth: '800px', fontFamily: 'monospace', fontSize: 'var(--font-size-xs)',
                padding: '0.5em', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
                resize: 'vertical',
              }}
            />
          </div>
        )}

        <div
          style={{
            padding: '0.25rem 1rem',
            borderTop: '1px solid var(--border)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-primary)',
          }}
        >
          Draw your diagram, then click "Export SVG" — supports UML, flowcharts, network diagrams, and more
        </div>
      </div>
    </div>
  )
}
