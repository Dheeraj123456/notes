import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function MermaidRenderer() {
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          background: cssVar('--bg-mermaid') || '#ffffff',
          primaryColor: cssVar('--accent') || '#0969da',
          primaryTextColor: cssVar('--text-primary') || '#1f2328',
          primaryBorderColor: cssVar('--border') || '#d0d7de',
          lineColor: cssVar('--accent') || '#0969da',
          secondaryColor: cssVar('--bg-secondary') || '#f6f8fa',
          tertiaryColor: cssVar('--bg-tertiary') || '#e8ecf0',
          fontSize: '14px',
        },
      })
    }

    const run = async () => {
      try {
        await mermaid.run({
          querySelector: '.mermaid',
        })
      } catch {
        // Mermaid diagrams that fail to render are silently ignored
      }
    }

    const timer = setTimeout(run, 100)
    return () => clearTimeout(timer)
  }, [])

  return null
}
