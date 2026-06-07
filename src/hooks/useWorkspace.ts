import { useState, useEffect, useCallback } from 'react'
import {
  type Workspace,
  type FileEntry,
  loadWorkspace,
  resetWorkspace,
  createBranch as storeCreateBranch,
  deleteBranch as storeDeleteBranch,
  renameBranch as storeRenameBranch,
  createCourse as storeCreateCourse,
  deleteCourse as storeDeleteCourse,
  renameCourse as storeRenameCourse,
  createFile as storeCreateFile,
  updateFile as storeUpdateFile,
  deleteFile as storeDeleteFile,
  renameFile as storeRenameFile,
  markFileSynced as storeMarkSynced,
  listFiles as storeListFiles,
  getFile as storeGetFile,
  getTemplate,
} from '../utils/workspace'

export interface WorkspaceAPI {
  workspace: Workspace
  loading: boolean
  error: string | null

  refresh: () => Promise<void>
  clearWorkspace: () => Promise<void>

  createBranch: (name: string) => Promise<void>
  deleteBranch: (name: string) => Promise<void>
  renameBranch: (oldName: string, newName: string) => Promise<void>

  createCourse: (branch: string, name: string) => Promise<void>
  deleteCourse: (branch: string, name: string) => Promise<void>
  renameCourse: (branch: string, oldName: string, newName: string) => Promise<void>

  createFile: (branch: string, course: string, filename: string, templateType?: string) => Promise<void>
  createFileWithContent: (branch: string, course: string, filename: string, content: string) => Promise<void>
  updateFile: (branch: string, course: string, filename: string, content: string) => Promise<void>
  deleteFile: (branch: string, course: string, filename: string) => Promise<void>
  renameFile: (branch: string, course: string, oldName: string, newName: string) => Promise<void>
  markFileSynced: (branch: string, course: string, filename: string, sha: string) => Promise<void>

  listFiles: (branch: string, course: string) => string[]
  getFile: (branch: string, course: string, filename: string) => FileEntry | undefined
}

export function useWorkspace(): WorkspaceAPI {
  const [workspace, setWorkspace] = useState<Workspace>({
    branches: [], courses: {}, files: {}, settings: { currentBranch: '', owner: '', repo: '', pat: '' },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const w = await loadWorkspace()
      setWorkspace(w)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const wrap = <T,>(fn: (w: Workspace) => Promise<Workspace>): Promise<T> => {
    return fn(structuredClone(workspace)).then(newW => {
      setWorkspace(newW)
      return undefined as T
    })
  }

  const api: WorkspaceAPI = {
    workspace, loading, error, refresh,

    clearWorkspace: async () => {
      await resetWorkspace()
      setWorkspace({ branches: [], courses: {}, files: {}, settings: { currentBranch: '', owner: '', repo: '', pat: '' } })
    },

    createBranch: (name) => wrap(() => storeCreateBranch(structuredClone(workspace), name)),
    deleteBranch: (name) => wrap(() => storeDeleteBranch(structuredClone(workspace), name)),
    renameBranch: (oldName, newName) => wrap(() => storeRenameBranch(structuredClone(workspace), oldName, newName)),

    createCourse: (branch, name) => wrap(() => storeCreateCourse(structuredClone(workspace), branch, name)),
    deleteCourse: (branch, name) => wrap(() => storeDeleteCourse(structuredClone(workspace), branch, name)),
    renameCourse: (branch, oldName, newName) => wrap(() => storeRenameCourse(structuredClone(workspace), branch, oldName, newName)),

    createFile: async (branch, course, filename, templateType = 'frontmatter') => {
      const content = getTemplate(templateType, filename)
      const result = await storeCreateFile(structuredClone(workspace), branch, course, filename, content)
      setWorkspace(result)
    },
    createFileWithContent: async (branch, course, filename, content) => {
      const result = await storeCreateFile(structuredClone(workspace), branch, course, filename, content)
      setWorkspace(result)
    },
    updateFile: (branch, course, filename, content) => wrap(() => storeUpdateFile(structuredClone(workspace), branch, course, filename, content)),
    deleteFile: (branch, course, filename) => wrap(() => storeDeleteFile(structuredClone(workspace), branch, course, filename)),
    renameFile: (branch, course, oldName, newName) => wrap(() => storeRenameFile(structuredClone(workspace), branch, course, oldName, newName)),
    markFileSynced: (branch, course, filename, sha) => wrap(() => storeMarkSynced(structuredClone(workspace), branch, course, filename, sha)),

    listFiles: (branch, course) => {
      const prefix = branch + '/' + course + '/'
      return Object.keys(workspace.files)
        .filter(k => k.startsWith(prefix) && workspace.files[k].status !== 'deleted')
        .map(k => k.slice(prefix.length))
    },
    getFile: (branch, course, filename) => storeGetFile(workspace, branch, course, filename),
  }

  return api
}
