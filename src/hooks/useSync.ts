import { useState, useCallback } from 'react'
import type { WorkspaceAPI } from './useWorkspace'
import {
  getGitHubConfig,
  saveGitHubFile,
  deleteGitHubFile,
  getGitHubFile,
  listGitHubFiles,
  pushBatch,
  type BatchChange,
  type GitHubConfig,
} from '../utils/github'

export interface SyncResult {
  path: string
  action: 'push' | 'pull' | 'delete'
  ok: boolean
  message: string
}

interface Conflict {
  path: string
  localContent: string
  remoteContent: string
  localModified: string
  remoteModified: string
  resolve: 'local' | 'remote' | null
}

export interface SyncAPI {
  syncing: boolean
  results: SyncResult[]
  conflicts: Conflict[]
  pushAll: (api: WorkspaceAPI) => Promise<void>
  pullAll: (api: WorkspaceAPI) => Promise<void>
  resolveConflict: (path: string, choice: 'local' | 'remote') => void
  clearConflicts: () => void
  clearResults: () => void
}

export function useSync(): SyncAPI {
  const [syncing, setSyncing] = useState(false)
  const [results, setResults] = useState<SyncResult[]>([])
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [config] = useState(getGitHubConfig)

  const pushAll = useCallback(async (api: WorkspaceAPI) => {
    setSyncing(true)
    setResults([])
    if (!config) {
      setResults([{ path: '', action: 'push', ok: false, message: 'GitHub not configured — content saved locally only. Click ⚙ Configure GitHub to set up.' }])
      setSyncing(false)
      return
    }
    const { workspace } = api
    const changes: BatchChange[] = []
    const syncResults: SyncResult[] = []

    for (const [filePath, entry] of Object.entries(workspace.files)) {
      if (entry.status === 'synced') continue

      const parts = filePath.split('/')
      const filename = parts.pop()!
      const course = parts.pop()!
      const branch = parts.join('/')
      const isMeta = filename.startsWith('_')
      const ext = isMeta ? '.json' : '.mdx'
      const ghPath = `content/${filePath}${ext}`

      if (entry.status === 'deleted') {
        if (entry.sha) {
          changes.push({ action: 'delete', path: ghPath, sha: entry.sha, message: `Delete ${filePath}${ext}` })
        } else {
          syncResults.push({ path: filePath, action: 'delete', ok: true, message: 'Skipped (never synced)' })
        }
      } else {
        changes.push({
          action: entry.sha ? 'update' : 'create',
          path: ghPath,
          content: entry.content,
          sha: entry.sha ?? undefined,
          message: entry.sha ? `Update ${filePath}${ext}` : `Create ${filePath}${ext}`,
        })
      }
    }

    if (changes.length === 0) {
      syncResults.push({ path: '', action: 'push', ok: true, message: 'Nothing to push' })
    } else {
      const batchResult = await pushBatch(changes)
      for (const r of batchResult.results) {
        const stripped = r.path.replace('content/', '').replace(/\.(mdx|json)$/, '')
        syncResults.push({ path: stripped, action: r.ok ? 'push' : 'delete', ok: r.ok, message: r.message })
      }
      // Mark synced
      for (let i = 0; i < changes.length; i++) {
        const change = changes[i]
        const r = batchResult.results[i]
        if (r.ok) {
          const pathParts = change.path.replace('content/', '').replace(/\.(mdx|json)$/, '').split('/')
          const filename = pathParts.pop()!
          const course = pathParts.pop()!
          const branch = pathParts.join('/')
          if (change.action !== 'delete') {
            await api.markFileSynced(branch, course, filename, r.sha || '')
          } else {
            // Deleted files are already removed from workspace
          }
        }
      }
    }

    setResults(syncResults)
    setSyncing(false)
  }, [config])

  const pullAll = useCallback(async (api: WorkspaceAPI) => {
    setSyncing(true)
    setResults([])
    setConflicts([])
    if (!config) {
      setResults([{ path: '', action: 'pull', ok: false, message: 'GitHub not configured — configure via ⚙ to pull remote files.' }])
      setSyncing(false)
      return
    }
    const { workspace } = api
    const syncResults: SyncResult[] = []
    const newConflicts: Conflict[] = []

    for (const branch of workspace.branches) {
      for (const course of (workspace.courses[branch] || [])) {
        const prefix = `content/${branch}/${course}`
        const ghFiles = await listGitHubFiles(prefix)
        for (const ghFile of ghFiles) {
          if (ghFile.type !== 'file') continue
          const isMeta = ghFile.name.startsWith('_')
          const filename = ghFile.name.replace(/\.(mdx|json)$/, '')
          const localPath = `${branch}/${course}/${filename}`
          const localEntry = workspace.files[localPath]

          if (!localEntry) {
            // New remote file
            const ghData = await getGitHubFile(ghFile.path)
            if (ghData) {
              if (isMeta) {
                // Store metadata files under the special key (name starts with _)
                await api.createFile(branch, course, filename, ghData.content)
                await api.updateFile(branch, course, filename, ghData.content)
              } else {
                await api.createFile(branch, course, ghFile.name, 'blank')
                await api.updateFile(branch, course, ghFile.name, ghData.content)
              }
              syncResults.push({ path: localPath, action: 'pull', ok: true, message: 'Downloaded' })
            }
          } else if (localEntry.status === 'synced') {
            // Update from remote
            const ghData = await getGitHubFile(ghFile.path)
            if (ghData && ghData.sha !== localEntry.sha) {
              await api.updateFile(branch, course, filename, ghData.content)
              syncResults.push({ path: localPath, action: 'pull', ok: true, message: 'Updated from remote' })
            }
          } else if (localEntry.status === 'modified' || localEntry.status === 'new') {
            // Conflict
            const ghData = await getGitHubFile(ghFile.path)
            if (ghData && ghData.sha !== localEntry.sha) {
              newConflicts.push({
                path: localPath,
                localContent: localEntry.content,
                remoteContent: ghData.content,
                localModified: localEntry.modified,
                remoteModified: '',
                resolve: null,
              })
            }
          }
        }
      }
    }

    setResults(syncResults)
    setConflicts(newConflicts)
    setSyncing(false)
  }, [config])

  const resolveConflict = useCallback((path: string, choice: 'local' | 'remote') => {
    setConflicts(prev => prev.map(c => c.path === path ? { ...c, resolve: choice } : c))
  }, [])

  const clearConflicts = useCallback(() => setConflicts([]), [])
  const clearResults = useCallback(() => setResults([]), [])

  return { syncing, results, conflicts, pushAll, pullAll, resolveConflict, clearConflicts, clearResults }
}
