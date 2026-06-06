import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import { useWorkspace } from '../hooks/useWorkspace'
import { useSync } from '../hooks/useSync'
import { WorkspaceTree } from '../components/Workspace/WorkspaceTree'
import { SyncPanel } from '../components/Workspace/SyncPanel'
import { EditorPreview } from '../components/Editor/EditorPreview'
import { EditorToolbar } from '../components/Editor/EditorToolbar'
import { GitHubSettingsModal } from '../components/Editor/GitHubSettingsModal'
import { SvgBuilder } from '../components/SvgBuilder/SvgBuilder'
import { getGitHubConfig, getGitHubFile, saveGitHubFile, type GitHubConfig } from '../utils/github'
import { createBranch as storeCreateBranch, createCourse as storeCreateCourse, createFile as storeCreateFile, loadWorkspace } from '../utils/workspace'

const BASE = import.meta.env.BASE_URL

export function WorkspacePage() {
  const { branch: urlBranch, course: urlCourse, note: urlNote } = useParams<{ branch: string; course: string; note: string }>()
  const api = useWorkspace()
  const { workspace, getFile, updateFile, deleteFile } = api

  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [svgBuilderOpen, setSvgBuilderOpen] = useState(false)

  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contentRef = useRef(content)
  contentRef.current = content

  const navigate = useNavigate()
  const gitHubConfig: GitHubConfig | null = getGitHubConfig()
  const sync = useSync()

  useEffect(() => {
    if (api.loading) return
    if (!urlBranch) return
    let cancelled = false

    async function init() {
      const w = await loadWorkspace()
      if (!w.branches.includes(urlBranch)) {
        await storeCreateBranch(w, urlBranch)
      }
      if (urlCourse) {
        const courses = w.courses[urlBranch] ?? []
        if (!courses.includes(urlCourse)) {
          await storeCreateCourse(w, urlBranch, urlCourse)
        }
      }

      if (urlBranch && urlCourse && urlNote) {
        const filename = urlNote.includes('.') ? urlNote : `${urlNote}.mdx`
        const path = `${urlBranch}/${urlCourse}/${filename}`
        const current = await loadWorkspace()
        const existing = current.files[`${urlBranch}/${urlCourse}/${filename}`]
        if (existing) {
          if (!cancelled) {
            setContent(existing.content)
            setTitle(filename.replace(/\.mdx?$/, ''))
            setSelectedFilePath(path)
            setLoading(false)
          }
        } else {
          const res = await fetch(`${BASE}api/raw-mdx/${urlBranch}/${urlCourse}/${urlNote}.mdx`)
          const rawContent = res.ok ? await res.text() : ''
          await storeCreateFile(current, urlBranch, urlCourse, filename, rawContent)
          if (!cancelled) {
            setContent(rawContent)
            setTitle(filename.replace(/\.mdx?$/, ''))
            setSelectedFilePath(path)
            setLoading(false)
          }
        }
      } else {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => { cancelled = true }
  }, [urlBranch, urlCourse, urlNote, api.loading])

  const currentFile = selectedFilePath ? getFileFromPath(selectedFilePath)?.entry : undefined

  function getFileFromPath(fp: string) {
    const parts = fp.split('/')
    if (parts.length < 2) return null
    const filename = parts.pop()!
    const course = parts.pop()!
    const branch = parts.join('/')
    return { branch, course, filename, entry: getFile(branch, course, filename) }
  }

  useEffect(() => {
    if (!selectedFilePath) {
      setContent('')
      setTitle('')
      setLoading(false)
      return
    }
    const info = getFileFromPath(selectedFilePath)
    if (info && info.entry) {
      setContent(info.entry.content)
      setTitle(info.filename.replace(/\.mdx?$/, ''))
      setLoading(false)
    }
  }, [selectedFilePath, workspace.files])

  const handleChange = useCallback((val?: string) => {
    const v = val ?? ''
    setContent(v)

    if (draftTimer.current) clearTimeout(draftTimer.current)
    draftTimer.current = setTimeout(() => {
      if (selectedFilePath) {
        const info = getFileFromPath(selectedFilePath)
        if (info) {
          updateFile(info.branch, info.course, info.filename, v)
          setSaveStatus('Saved')
          setTimeout(() => setSaveStatus(null), 2000)
        }
      }
    }, 3000)
  }, [selectedFilePath, updateFile])

  const handleSaveLocal = useCallback(() => {
    if (selectedFilePath) {
      const info = getFileFromPath(selectedFilePath)
      if (info) {
        updateFile(info.branch, info.course, info.filename, content)
        setSaveStatus('Saved')
        setTimeout(() => setSaveStatus(null), 2000)
      }
    }
  }, [selectedFilePath, content, updateFile])

  const handleDownload = useCallback(() => {
    const info = selectedFilePath ? getFileFromPath(selectedFilePath) : null
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = info?.filename ?? 'note.mdx'
    a.click()
    URL.revokeObjectURL(url)
    setSaveStatus('Downloaded')
    setTimeout(() => setSaveStatus(null), 2000)
  }, [content, selectedFilePath])

  const handleCommit = useCallback(async () => {
    if (!selectedFilePath) return
    const info = getFileFromPath(selectedFilePath)
    if (!info) return

    setSaveStatus('Committing...')
    const filePath = `content/${selectedFilePath}.mdx`
    const existing = await getGitHubFile(filePath)
    const result = await saveGitHubFile(
      filePath,
      content,
      `Update ${selectedFilePath}.mdx`,
      existing?.sha,
    )
    setSaveStatus(result.message)
    if (result.ok && result.sha) {
      await api.markFileSynced(info.branch, info.course, info.filename, result.sha)
    }
    setTimeout(() => setSaveStatus(null), 4000)
  }, [selectedFilePath, content, api])

  const handleDelete = useCallback(() => {
    if (!selectedFilePath) return
    const info = getFileFromPath(selectedFilePath)
    if (info) {
      deleteFile(info.branch, info.course, info.filename)
      setSelectedFilePath(null)
      setContent('')
      setTitle('')
    }
  }, [selectedFilePath, deleteFile])

  const handleBack = useCallback(() => {
    if (urlBranch && urlCourse && urlNote) {
      navigate(`/${urlBranch}/${urlCourse}/${urlNote}`)
    } else if (urlBranch && urlCourse) {
      navigate(`/${urlBranch}/${urlCourse}`)
    } else if (urlBranch) {
      navigate(`/${urlBranch}`)
    } else {
      navigate('/')
    }
  }, [navigate, urlBranch, urlCourse, urlNote])

  if (api.loading) {
    return (
      <div style={{ padding: '2rem', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
        Loading workspace...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{
        width: '280px', minWidth: '280px', borderRight: '1px solid var(--border)',
        backgroundColor: 'var(--bg-secondary)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        <WorkspaceTree
          api={api}
          selectedFile={selectedFilePath}
          onSelectFile={setSelectedFilePath}
          initialExpanded={urlBranch ? [`${urlBranch}${urlCourse ? `/${urlCourse}` : ''}`] : undefined}
        />
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <SyncPanel sync={sync} api={api} onOpenGitHubSettings={() => setSettingsOpen(true)} />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedFilePath ? (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.25rem 0.75rem',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedFilePath}
              </span>
            </div>

            <EditorToolbar
              title={title}
              hasDraft={false}
              gitHubConfig={gitHubConfig}
              saveStatus={saveStatus}
              onSaveLocal={handleSaveLocal}
              onDownload={handleDownload}
              onCommit={handleCommit}
              onSettings={() => setSettingsOpen(true)}
              onDelete={handleDelete}
              onBack={handleBack}
              onDrawIo={() => setSvgBuilderOpen(true)}
              fileChanged={currentFile?.status === 'modified'}
            />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <div style={{ flex: showPreview ? 1 : 1, overflow: 'auto', borderRight: showPreview ? '1px solid var(--border)' : 'none' }}>
                <MDEditor
                  value={content}
                  onChange={handleChange}
                  preview="edit"
                  height="100%"
                  style={{ height: '100%' }}
                  textareaProps={{
                    placeholder: 'Start writing markdown...',
                    style: { fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' },
                  }}
                />
              </div>

              {showPreview && (
                <div style={{ flex: 1, overflow: 'auto', backgroundColor: 'var(--bg-primary)' }}>
                  <EditorPreview content={content} />
                </div>
              )}
            </div>

            <div style={{ position: 'fixed', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
              <button
                onClick={() => setShowPreview(v => !v)}
                style={{
                  padding: '0.4em 1em', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem' }}>📝</div>
            <div style={{ fontSize: 'var(--font-size-base)' }}>Select a file from the workspace tree</div>
            <div style={{ fontSize: 'var(--font-size-sm)' }}>
              Or create a new branch, course, or file to get started
            </div>
          </div>
        )}
      </div>

      <GitHubSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {svgBuilderOpen && (
        <SvgBuilder
          onInsert={(code) => {
            const pos = contentRef.current.length
            const before = contentRef.current.slice(0, pos)
            const after = contentRef.current.slice(pos)
            const newContent = before + '\n' + code + '\n' + after
            setContent(newContent)
            if (selectedFilePath) {
              const info = getFileFromPath(selectedFilePath)
              if (info) updateFile(info.branch, info.course, info.filename, newContent)
            }
          }}
          onClose={() => setSvgBuilderOpen(false)}
        />
      )}
    </div>
  )
}
