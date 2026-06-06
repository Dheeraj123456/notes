import { useEffect, useRef, useMemo, type DetailedHTMLProps, type HTMLAttributes } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
// @ts-expect-error plantuml-encoder has no types
import { encode as plantumlEncode } from 'plantuml-encoder'
import yaml from 'js-yaml'
import mermaid from 'mermaid'
import { GraphView } from '../GraphView'
import { Diagram } from '../Diagram/Diagram'
import type { DiagramData, DiagramProps } from '../Diagram/types'

type DiagramPropsType = DiagramProps['type']

interface Props {
  content: string
}

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function extractAttr(attrs: string, name: string): string | null {
  const regex = new RegExp(`${name}=(["'])`)
  const keyMatch = attrs.match(regex)
  if (!keyMatch) return null
  const quote = keyMatch[1]
  const rest = attrs.slice(keyMatch.index! + keyMatch[0].length)
  const endIdx = rest.indexOf(quote)
  if (endIdx === -1) return null
  return rest.slice(0, endIdx)
}

function extractDataAttr(attrs: string): string | null {
  const dataMatch = attrs.match(/data=\{/)
  if (!dataMatch) return null
  let depth = 0
  let start = dataMatch.index! + 6
  let result = ''
  for (let i = start; i < attrs.length; i++) {
    const ch = attrs[i]
    if (ch === '{' || ch === '[') depth++
    else if (ch === '}' || ch === ']') {
      depth--
      if (depth < 0) break
    }
    result += ch
  }
  return result.replace(/\s+/g, ' ').trim()
}

function jsToJson(str: string): string {
  return str.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
}

function preprocessForPreview(markdown: string): string {
  return markdown.replace(
    /<GraphView\s+([^>]*)\/>/g,
    (_match, attrs) => {
      const title = extractAttr(attrs, 'title') ?? ''
      const type = extractAttr(attrs, 'type') ?? 'bar'
      const rawData = extractDataAttr(attrs) ?? '[]'
      const jsonData = jsToJson(rawData)
      const escaped = jsonData.replace(/"/g, '&quot;')
      return `<div class="graph-view-placeholder" data-gv-title="${title}" data-gv-type="${type}" data-gv-data='${escaped}'></div>`
    },
  )
}

function MermaidBlock({ code }: { code: string }) {
  return <pre className="mermaid" style={{ textAlign: 'center' }}>{code}</pre>
}

function PlantUmlBlock({ code }: { code: string }) {
  const encoded = plantumlEncode(code)
  const url = `https://www.plantuml.com/plantuml/svg/${encoded}`
  return (
    <div style={{ textAlign: 'center', margin: '1em 0' }}>
      <img src={url} alt="PlantUML diagram" style={{ maxWidth: '100%' }} />
    </div>
  )
}

let mermaidInit = false

export function EditorPreview({ content }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const processedContent = useMemo(() => preprocessForPreview(content), [content])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const mermaidElements = container.querySelectorAll<HTMLPreElement>('.mermaid')
    if (mermaidElements.length > 0) {
      if (!mermaidInit) {
        mermaidInit = true
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
      const timer = setTimeout(async () => {
        try {
          await mermaid.run({ nodes: mermaidElements })
        } catch {
          // silently ignore mermaid render errors
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [content])

  return (
    <div
      ref={containerRef}
      style={{
        padding: '0.75rem',
        overflow: 'auto',
        lineHeight: 1.8,
        color: 'var(--text-primary)',
        fontSize: 'var(--font-size-md)',
        maxWidth: 'var(--content-max-width)',
        minWidth: 0,
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className ?? '')
            const code = String(children).replace(/\n$/, '')
            if (match && match[1] === 'mermaid') return <MermaidBlock code={code} />
            if (match && match[1] === 'plantuml') return <PlantUmlBlock code={code} />
            if (match && match[1] === 'svg') {
              const svgContent = code.trim()
              return (
                <div
                  className="svg-block"
                  dangerouslySetInnerHTML={{ __html: svgContent.startsWith('<svg') || svgContent.startsWith('<SVG') ? svgContent : `<svg xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>` }}
                  style={{ margin: '1em 0', textAlign: 'center' }}
                />
              )
            }
            if (match && match[1] === 'diagram') {
              try {
                const parsed = yaml.load(code) as { type: string; data?: DiagramData; [key: string]: unknown }
                const diagramType = parsed.type as DiagramPropsType
                const diagramData: DiagramData = parsed.data ?? parsed as unknown as DiagramData
                if (['flow', 'tree', 'network', 'venn', 'bar', 'line'].includes(diagramType)) {
                  return <Diagram type={diagramType} data={diagramData} />
                }
              } catch {
                // parsing failed — render as fallback code
              }
            }
            return <code className={className} {...props}>{children}</code>
          },
          div(props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
            const { className, ...rest } = props
            if (className === 'graph-view-placeholder') {
              const title = (rest as Record<string, string>)['data-gv-title'] ?? ''
              const type = ((rest as Record<string, string>)['data-gv-type'] ?? 'bar') as 'bar' | 'line'
              const dataStr = ((rest as Record<string, string>)['data-gv-data'] ?? '[]').replace(/&quot;/g, '"')
              let data
              try {
                data = JSON.parse(dataStr)
              } catch {
                data = []
              }
              return <GraphView title={title} type={type} data={data} />
            }
            return <div className={className} {...rest} />
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
