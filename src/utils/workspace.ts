import { get, set, del } from 'idb-keyval'

const STORE_KEY = 'workspace'

export interface FileEntry {
  content: string
  created: string
  modified: string
  sha: string | null
  status: 'synced' | 'modified' | 'new' | 'deleted'
}

export interface Workspace {
  branches: string[]
  courses: Record<string, string[]>
  files: Record<string, FileEntry>
  settings: {
    currentBranch: string
    owner: string
    repo: string
    pat: string
  }
}

const DEFAULT_WORKSPACE: Workspace = {
  branches: [],
  courses: {},
  files: {},
  settings: { currentBranch: '', owner: '', repo: '', pat: '' },
}

function path(branch: string, course: string, filename: string): string {
  return `${branch}/${course}/${filename}`
}

export async function loadWorkspace(): Promise<Workspace> {
  const data = await get(STORE_KEY)
  return data ? JSON.parse(data) as Workspace : structuredClone(DEFAULT_WORKSPACE)
}

export async function saveWorkspace(w: Workspace): Promise<void> {
  await set(STORE_KEY, JSON.stringify(w))
}

export async function resetWorkspace(): Promise<void> {
  await del(STORE_KEY)
}

export async function createBranch(w: Workspace, name: string): Promise<Workspace> {
  if (w.branches.includes(name)) return w
  w.branches = [...w.branches, name]
  w.courses[name] = []
  const metaPath = `${name}/_branch_`
  if (!w.files[metaPath]) {
    const now = new Date().toISOString()
    w.files[metaPath] = {
      content: JSON.stringify({ id: name, name, description: '', icon: '📁', order: 99 }, null, 2),
      created: now, modified: now, sha: null, status: 'new',
    }
  }
  await saveWorkspace(w)
  return w
}

export async function deleteBranch(w: Workspace, name: string): Promise<Workspace> {
  w.branches = w.branches.filter(b => b !== name)
  delete w.courses[name]
  for (const key of Object.keys(w.files)) {
    if (key.startsWith(name + '/')) delete w.files[key]
  }
  if (w.settings.currentBranch === name) w.settings.currentBranch = ''
  await saveWorkspace(w)
  return w
}

export async function renameBranch(w: Workspace, oldName: string, newName: string): Promise<Workspace> {
  if (!w.branches.includes(oldName) || w.branches.includes(newName)) return w
  w.branches = w.branches.map(b => b === oldName ? newName : b)
  w.courses[newName] = w.courses[oldName] || []
  delete w.courses[oldName]
  const toMove = Object.keys(w.files).filter(k => k.startsWith(oldName + '/'))
  for (const key of toMove) {
    const newKey = key.replace(oldName + '/', newName + '/')
    w.files[newKey] = w.files[key]
    delete w.files[key]
  }
  if (w.settings.currentBranch === oldName) w.settings.currentBranch = newName
  await saveWorkspace(w)
  return w
}

export async function createCourse(w: Workspace, branch: string, name: string): Promise<Workspace> {
  if (!w.courses[branch]) w.courses[branch] = []
  if (w.courses[branch].includes(name)) return w
  w.courses[branch] = [...w.courses[branch], name]
  const metaPath = `${branch}/${name}/_course_`
  if (!w.files[metaPath]) {
    const now = new Date().toISOString()
    w.files[metaPath] = {
      content: JSON.stringify({ id: name, name, description: '', order: 99 }, null, 2),
      created: now, modified: now, sha: null, status: 'new',
    }
  }
  await saveWorkspace(w)
  return w
}

export async function deleteCourse(w: Workspace, branch: string, name: string): Promise<Workspace> {
  if (!w.courses[branch]) return w
  w.courses[branch] = w.courses[branch].filter(c => c !== name)
  for (const key of Object.keys(w.files)) {
    if (key.startsWith(branch + '/' + name + '/')) delete w.files[key]
  }
  await saveWorkspace(w)
  return w
}

export async function renameCourse(w: Workspace, branch: string, oldName: string, newName: string): Promise<Workspace> {
  if (!w.courses[branch]?.includes(oldName) || w.courses[branch]?.includes(newName)) return w
  w.courses[branch] = w.courses[branch].map(c => c === oldName ? newName : c)
  const prefix = branch + '/' + oldName + '/'
  const toMove = Object.keys(w.files).filter(k => k.startsWith(prefix))
  for (const key of toMove) {
    const newKey = key.replace(prefix, branch + '/' + newName + '/')
    w.files[newKey] = w.files[key]
    delete w.files[key]
  }
  await saveWorkspace(w)
  return w
}

export async function createFile(
  w: Workspace,
  branch: string,
  course: string,
  filename: string,
  content: string,
): Promise<Workspace> {
  const p = path(branch, course, filename)
  if (w.files[p]) return w
  const now = new Date().toISOString()
  w.files[p] = { content, created: now, modified: now, sha: null, status: 'new' }
  await saveWorkspace(w)
  return w
}

export async function updateFile(
  w: Workspace,
  branch: string,
  course: string,
  filename: string,
  content: string,
): Promise<Workspace> {
  const p = path(branch, course, filename)
  const existing = w.files[p]
  const now = new Date().toISOString()
  w.files[p] = {
    content,
    created: existing?.created ?? now,
    modified: now,
    sha: existing?.sha ?? null,
    status: existing?.status === 'synced' ? 'modified' : (existing?.status || 'new'),
  }
  await saveWorkspace(w)
  return w
}

export async function markFileSynced(
  w: Workspace,
  branch: string,
  course: string,
  filename: string,
  sha: string,
): Promise<Workspace> {
  const p = path(branch, course, filename)
  if (!w.files[p]) return w
  w.files[p] = { ...w.files[p], status: 'synced', sha }
  await saveWorkspace(w)
  return w
}

export async function deleteFile(
  w: Workspace,
  branch: string,
  course: string,
  filename: string,
): Promise<Workspace> {
  const p = path(branch, course, filename)
  if (w.files[p] && w.files[p].status === 'new') {
    delete w.files[p]
  } else if (w.files[p]) {
    w.files[p] = { ...w.files[p], status: 'deleted' }
  }
  await saveWorkspace(w)
  return w
}

export async function renameFile(
  w: Workspace,
  branch: string,
  course: string,
  oldName: string,
  newName: string,
): Promise<Workspace> {
  const oldP = path(branch, course, oldName)
  const newP = path(branch, course, newName)
  if (!w.files[oldP] || w.files[newP]) return w
  w.files[newP] = { ...w.files[oldP] }
  delete w.files[oldP]
  await saveWorkspace(w)
  return w
}

export async function listFiles(w: Workspace, branch: string, course: string): Promise<string[]> {
  const prefix = branch + '/' + course + '/'
  return Object.keys(w.files)
    .filter(k => k.startsWith(prefix) && w.files[k].status !== 'deleted')
    .map(k => k.slice(prefix.length))
}

export function getFile(w: Workspace, branch: string, course: string, filename: string): FileEntry | undefined {
  return w.files[path(branch, course, filename)]
}

export function getTemplate(type: string, name: string): string {
  const now = new Date().toISOString().split('T')[0]
  switch (type) {
    case 'blank':
      return ''
    case 'frontmatter':
      return `---
title: ${name}
description:
date: ${now}
---

# ${name}

`
    case 'mermaid':
      return `---
title: ${name}
description:
date: ${now}
---

# ${name}

\`\`\`mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`
`
    case 'latex':
      return `---
title: ${name}
description:
date: ${now}
---

# ${name}

$$
f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi) e^{2\\pi i \\xi x} d\\xi
$$
`
    case 'svg':
      return `---
title: ${name}
description:
date: ${now}
---

# ${name}

\`\`\`svg
<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="80" height="40" rx="8" fill="#4ecdc4"/>
  <circle cx="150" cy="50" r="25" fill="#ff6b6b"/>
</svg>
\`\`\`
`
    case 'diagram':
      return `---
title: ${name}
description:
date: ${now}
---

# ${name}

\`\`\`diagram
type: flow
nodes:
  - id: start
    label: "Start"
    x: 50
    y: 50
  - id: process
    label: "Process"
    x: 50
    y: 150
edges:
  - from: start
    to: process
\`\`\`
`
    default:
      return `---
title: ${name}
description:
date: ${now}
---

# ${name}

`
  }
}
