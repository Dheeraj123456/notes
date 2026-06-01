import { type ComponentType, Suspense, useMemo, useCallback, type AnchorHTMLAttributes, type MouseEvent } from 'react'
import { MDXProvider } from '@mdx-js/react'
import { useNavigate } from 'react-router-dom'
import { MermaidRenderer } from './MermaidRenderer'
import { GraphView } from '../GraphView'

interface ContentModule {
  default: ComponentType<Record<string, unknown>>
  title?: string
  description?: string
}

const contentModules = import.meta.glob<ContentModule>('/content/**/*.{md,mdx}', {
  eager: true,
})

function normalizePath(path: string): string {
  return path
    .replace(/^\/content\//, '')
    .replace(/\.(md|mdx)$/, '')
    .replace(/\/index$/, '')
}

function getModuleKey(slug: string): string | undefined {
  const slugNormalized = slug.replace(/\/$/, '')
  for (const [filepath] of Object.entries(contentModules)) {
    const normalized = normalizePath(filepath)
    if (normalized === slugNormalized) {
      return filepath
    }
  }
  return undefined
}

function MDXLink({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const navigate = useNavigate()

  const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    if (!href) return
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//') || href.startsWith('mailto:')) return
    if (href.startsWith('#')) return
    e.preventDefault()
    navigate(href)
  }, [href, navigate])

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}

interface MarkdownRendererProps {
  slug: string
}

const components = {
  GraphView,
  a: MDXLink,
}

export function MarkdownRenderer({ slug }: MarkdownRendererProps) {
  const Content = useMemo(() => {
    const key = getModuleKey(slug)
    if (!key) return null
    const mod = contentModules[key]
    if (!mod || typeof mod.default !== 'function') return null
    return mod.default as ComponentType<Record<string, unknown>>
  }, [slug])

  if (!Content) {
    return (
      <div style={{ color: 'var(--text-secondary)', padding: '2rem 0', fontSize: 'var(--font-size-sm)' }}>
        Content not found for: <strong>{slug}</strong>
      </div>
    )
  }

  return (
    <Suspense fallback={<div style={{ color: 'var(--text-secondary)' }}>Loading...</div>}>
      <MDXProvider components={components}>
        <div
          style={{
            lineHeight: 1.8,
            color: 'var(--text-primary)',
            maxWidth: 'var(--content-max-width)',
            minWidth: 0,
          }}
        >
          <Content />
          <MermaidRenderer />
        </div>
      </MDXProvider>
    </Suspense>
  )
}
