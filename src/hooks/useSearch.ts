import { useMemo } from 'react'
import MiniSearch from 'minisearch'

export type SearchScope = 'all' | 'branch' | 'course'

interface SearchDoc {
  id: string
  title: string
  description: string
  text: string
  branchId: string
  courseId: string
  path: string
}

let searchInstance: MiniSearch<SearchDoc> | null = null
let searchDocs: SearchDoc[] = []

function getRawContentModules(): Record<string, string> {
  const mods = import.meta.glob<{
    default: unknown
    frontmatter?: Record<string, string>
  }>('/content/**/*.{md,mdx}', { eager: true })

  const result: Record<string, string> = {}
  for (const [path, mod] of Object.entries(mods)) {
    const slug = path
      .replace('/content/', '')
      .replace(/\.(md|mdx)$/, '')
      .replace(/\/index$/, '')
    if (slug.endsWith('/_branch_') || slug.endsWith('/_course_')) continue

    const fm = mod?.frontmatter
    const title = (fm && typeof fm === 'object' ? (fm as Record<string, string>).title : '') || ''
    const description = (fm && typeof fm === 'object' ? (fm as Record<string, string>).description : '') || ''
    result[path] = `---\ntitle: ${title}\ndescription: ${description}\n---\n`
  }
  return result
}

function stripFrontmatter(text: string): string {
  return text.replace(/^---[\s\S]*?---\n*/, '')
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^###?\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\[{2}([^\]|]+)(?:\|([^\]|]+))?\]{2}/g, '$2$1')
    .replace(/[#*_~>`\\|]/g, '')
    .replace(/\n{3,}/g, '\n')
    .trim()
}

function extractTitle(raw: string): string {
  const titleMatch = raw.match(/^---[\s\S]*?title:\s*(.+?)[\s\S]*?---/)
  if (titleMatch) return titleMatch[1].replace(/["']/g, '').trim()
  const headingMatch = raw.match(/^#\s+(.+)/m)
  if (headingMatch) return headingMatch[1].trim()
  return ''
}

function extractDescription(raw: string): string {
  const descMatch = raw.match(/^---[\s\S]*?description:\s*(.+?)[\s\S]*?---/)
  if (descMatch) return descMatch[1].replace(/["']/g, '').trim()
  return ''
}

function buildSearchIndex(): { miniSearch: MiniSearch<SearchDoc>; docs: SearchDoc[] } {
  if (searchInstance && searchDocs.length > 0) {
    return { miniSearch: searchInstance, docs: searchDocs }
  }

  const rawModules = getRawContentModules()
  const docs: SearchDoc[] = []

  for (const [filepath, raw] of Object.entries(rawModules)) {
    const slug = filepath
      .replace('/content/', '')
      .replace(/\.(md|mdx)$/, '')
      .replace(/\/index$/, '')

    if (slug.endsWith('/_branch_') || slug.endsWith('/_course_')) continue

    const parts = slug.split('/')
    const branchId = parts[0]
    const courseId = parts[1] ?? ''

    const stripped = stripFrontmatter(raw)
    const text = stripMarkdown(stripped)
    const title = extractTitle(raw)
    const description = extractDescription(raw)

    if (title) {
      docs.push({
        id: slug,
        title,
        description,
        text: text.slice(0, 3000),
        branchId,
        courseId,
        path: `/${slug}`,
      })
    }
  }

  const miniSearch = new MiniSearch<SearchDoc>({
    fields: ['title', 'description', 'text'],
    storeFields: ['title', 'description', 'path', 'branchId', 'courseId'],
    searchOptions: {
      boost: { title: 5, description: 3, text: 1 },
      fuzzy: 0.2,
      prefix: true,
    },
  })

  miniSearch.addAll(docs)
  searchInstance = miniSearch
  searchDocs = docs

  return { miniSearch, docs }
}

export function useSearch(query: string, scope: SearchScope, scopeBranch?: string, scopeCourse?: string) {
  const index = useMemo(() => buildSearchIndex(), [])

  const results = useMemo(() => {
    if (!query.trim()) return []

    let rawResults = index.miniSearch.search(query.trim())

    if (scope === 'branch' && scopeBranch) {
      rawResults = rawResults.filter((r) => {
        const doc = index.docs.find((d) => d.id === r.id)
        return doc?.branchId === scopeBranch
      })
    } else if (scope === 'course' && scopeBranch && scopeCourse) {
      rawResults = rawResults.filter((r) => {
        const doc = index.docs.find((d) => d.id === r.id)
        return doc?.branchId === scopeBranch && doc?.courseId === scopeCourse
      })
    }

    return rawResults.map((r) => ({
      ...r,
      ...index.miniSearch.getStoredFields(r.id),
    }))
  }, [query, scope, scopeBranch, scopeCourse, index])

  return { results }
}
