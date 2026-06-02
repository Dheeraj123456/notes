import { useMemo } from 'react'
import MiniSearch from 'minisearch'
import matter from 'gray-matter'

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

const rawModules = import.meta.glob('/content/**/*.{md,mdx}', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function extractTitleFromBody(body: string): string {
  const match = body.match(/^#\s+(.+)/m)
  return match ? match[1].trim() : ''
}

function buildSearchIndex(): { miniSearch: MiniSearch<SearchDoc>; docs: SearchDoc[] } {
  if (searchInstance && searchDocs.length > 0) {
    return { miniSearch: searchInstance, docs: searchDocs }
  }

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

    const parsed = matter(raw)
    const title = parsed.data.title || extractTitleFromBody(parsed.content) || slug.split('/').pop() || ''
    const description = parsed.data.description || ''
    const text = stripMarkdown(parsed.content).slice(0, 3000)

    docs.push({
      id: slug,
      title,
      description,
      text,
      branchId,
      courseId,
      path: `/${slug}`,
    })
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
