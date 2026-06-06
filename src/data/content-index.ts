import type { ComponentType } from 'react'
import { loadWorkspace } from '../utils/workspace'

export interface BranchMeta {
  id: string
  name: string
  description: string
  icon?: string
  order?: number
}

export interface CourseMeta {
  id: string
  name: string
  description: string
  order?: number
  branchId: string
}

export interface NoteMeta {
  title: string
  description?: string
  slug: string
  branchId: string
  courseId: string
}

const branchModules = import.meta.glob<{ default: BranchMeta }>('/content/*/_branch_.json', {
  eager: true,
})

const courseModules = import.meta.glob<{ default: CourseMeta }>('/content/*/*/_course_.json', {
  eager: true,
})

const mdxModules = import.meta.glob<{
  default: ComponentType<Record<string, unknown>>
  title?: string
  description?: string
}>('/content/**/*.{md,mdx}', {
  eager: true,
})

function branchIdFromPath(path: string): string {
  return path.replace('/content/', '').split('/')[0]
}

function courseIdFromPath(path: string): string {
  const parts = path.replace('/content/', '').split('/')
  return parts[1] ?? ''
}

function noteSlugFromPath(path: string): string {
  return path
    .replace('/content/', '')
    .replace(/\.(md|mdx)$/, '')
    .replace(/\/index$/, '')
}

function noteCourseFromPath(path: string): { branchId: string; courseId: string } {
  const parts = path.replace('/content/', '').split('/')
  return { branchId: parts[0], courseId: parts[1] ?? '' }
}

export function getAllBranches(): BranchMeta[] {
  const branches: BranchMeta[] = []
  for (const [path, mod] of Object.entries(branchModules)) {
    branches.push({ ...mod.default, id: branchIdFromPath(path) })
  }
  return branches.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
}

export function getBranch(id: string): BranchMeta | undefined {
  return getAllBranches().find((b) => b.id === id)
}

export function getCoursesForBranch(branchId: string): CourseMeta[] {
  const courses: CourseMeta[] = []
  for (const [path, mod] of Object.entries(courseModules)) {
    if (branchIdFromPath(path) === branchId) {
      courses.push({
        ...mod.default,
        branchId,
        id: courseIdFromPath(path),
      })
    }
  }
  return courses.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
}

export function getCourse(branchId: string, courseId: string): CourseMeta | undefined {
  return getCoursesForBranch(branchId).find((c) => c.id === courseId)
}

export function getNotesForCourse(branchId: string, courseId: string): NoteMeta[] {
  const notes: NoteMeta[] = []
  for (const [path, mod] of Object.entries(mdxModules)) {
    const { branchId: bId, courseId: cId } = noteCourseFromPath(path)
    if (bId === branchId && cId === courseId) {
      notes.push({
        title: mod.title ?? noteSlugFromPath(path).split('/').pop()?.replace(/-/g, ' ') ?? 'Untitled',
        description: mod.description,
        slug: noteSlugFromPath(path),
        branchId,
        courseId,
      })
    }
  }
  return notes
}

export function getNote(slug: string): NoteMeta | undefined {
  for (const [path] of Object.entries(mdxModules)) {
    if (noteSlugFromPath(path) === slug) {
      const { branchId, courseId } = noteCourseFromPath(path)
      return {
        title: 'Note',
        slug,
        branchId,
        courseId,
      }
    }
  }
  return undefined
}

export function hasMdxModule(slug: string): boolean {
  for (const [path] of Object.entries(mdxModules)) {
    if (noteSlugFromPath(path) === slug) return true
  }
  return false
}

export function resolveWikiSlug(slug: string): string | undefined {
  const knownSlugs = new Map<string, string>()
  for (const [path] of Object.entries(mdxModules)) {
    knownSlugs.set(noteSlugFromPath(path), path)
  }
  const resolved = knownSlugs.get(slug)
  return resolved ? `/${slug}` : undefined
}

export async function getWorkspaceCourses(branchId: string): Promise<CourseMeta[]> {
  try {
    const w = await loadWorkspace()
    const staticIds = new Set(getCoursesForBranch(branchId).map(c => c.id))
    return (w.courses[branchId] || [])
      .filter(name => !staticIds.has(name))
      .map(name => ({ id: name, name, description: '', branchId, order: 99 }))
  } catch {
    return []
  }
}

export async function getWorkspaceBranches(): Promise<BranchMeta[]> {
  try {
    const w = await loadWorkspace()
    const staticIds = new Set(getAllBranches().map(b => b.id))
    return w.branches
      .filter(name => !staticIds.has(name))
      .map(name => ({ id: name, name, description: '', icon: '📁', order: 99 }))
  } catch {
    return []
  }
}
