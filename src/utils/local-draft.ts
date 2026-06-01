const STORAGE_PREFIX = 'opencode_draft:'

export interface Draft {
  slug: string
  title: string
  content: string
  updatedAt: number
}

function storageKey(slug: string): string {
  return `${STORAGE_PREFIX}${slug}`
}

export function getDraft(slug: string): Draft | null {
  try {
    const raw = localStorage.getItem(storageKey(slug))
    if (!raw) return null
    return JSON.parse(raw) as Draft
  } catch {
    return null
  }
}

export function setDraft(slug: string, title: string, content: string): void {
  try {
    const draft: Draft = { slug, title, content, updatedAt: Date.now() }
    localStorage.setItem(storageKey(slug), JSON.stringify(draft))
  } catch {
    // localStorage full or unavailable
  }
}

export function removeDraft(slug: string): void {
  try {
    localStorage.removeItem(storageKey(slug))
  } catch {
    // ignore
  }
}

export function listDrafts(): Draft[] {
  const drafts: Draft[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const raw = localStorage.getItem(key)
        if (raw) {
          try {
            drafts.push(JSON.parse(raw) as Draft)
          } catch {
            // corrupt entry, skip
          }
        }
      }
    }
  } catch {
    // localStorage unavailable
  }
  return drafts.sort((a, b) => b.updatedAt - a.updatedAt)
}
