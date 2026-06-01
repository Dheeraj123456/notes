import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import { EditorToolbar } from '../components/Editor/EditorToolbar'
import { EditorPreview } from '../components/Editor/EditorPreview'
import { GitHubSettingsModal } from '../components/Editor/GitHubSettingsModal'
import { getDraft, setDraft, removeDraft } from '../utils/local-draft'
import { getGitHubConfig, getGitHubFile, saveGitHubFile, type GitHubConfig } from '../utils/github'
import { loadRawMdx } from '../utils/load-raw-mdx'

export function EditorPage() {
  const navigate = useNavigate()
  const { branch, course, note } = useParams<{ branch: string; course: string; note: string }>()
  const slug = `${branch}/${course}/${note}`

  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [hasDraft, setHasDraft] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contentRef = useRef(content)
  contentRef.current = content

  const gitHubConfig: GitHubConfig | null = getGitHubConfig()

  useEffect(() => {
    async function load() {
      setLoading(true)

      // 1. Check local draft
      const draft = getDraft(slug)
      if (draft) {
        setContent(draft.content)
        setTitle(draft.title)
        setHasDraft(true)
        setLoading(false)
        return
      }

      // 2. Check GitHub
      const filePath = `content/${slug}.mdx`
      const ghFile = await getGitHubFile(filePath)
      if (ghFile) {
        setContent(ghFile.content)
        setTitle(extractTitle(ghFile.content) ?? note ?? '')
        setLoading(false)
        return
      }

      // 3. Check bundled MDX (existing content from build)
      const raw = await loadRawMdx(slug)
      if (raw) {
        setContent(raw)
        setTitle(extractTitle(raw) ?? note ?? '')
        setLoading(false)
        return
      }

      // 4. Start with template
      const template = generateTemplate(note ?? '')
      setContent(template)
      setTitle(note ?? '')
      setLoading(false)
    }
    load()
  }, [slug, note])

  useEffect(() => {
    return () => {
      const c = contentRef.current
      if (c && c.trim()) {
        const t = extractTitle(c) ?? note ?? ''
        setDraft(slug, t, c)
      }
    }
  }, [slug, note])

  const handleChange = useCallback((val?: string) => {
    const v = val ?? ''
    setContent(v)
    setHasDraft(true)

    // Auto-save draft with 5s debounce
    if (draftTimer.current) clearTimeout(draftTimer.current)
    draftTimer.current = setTimeout(() => {
      const t = extractTitle(v) ?? note ?? ''
      setDraft(slug, t, v)
      setTitle(t)
      setSaveStatus('Draft saved')
      setTimeout(() => setSaveStatus(null), 2000)
    }, 5000)
  }, [slug, note])

  const handleSaveLocal = useCallback(() => {
    const t = extractTitle(content) ?? note ?? ''
    setDraft(slug, t, content)
    setTitle(t)
    setHasDraft(true)
    setSaveStatus('Draft saved')
    setTimeout(() => setSaveStatus(null), 2000)
  }, [content, slug, note])

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${note ?? 'note'}.mdx`
    a.click()
    URL.revokeObjectURL(url)
    setSaveStatus('Downloaded')
    setTimeout(() => setSaveStatus(null), 2000)
  }, [content, note])

  const handleCommit = useCallback(async () => {
    setSaveStatus('Committing...')
    const filePath = `content/${slug}.mdx`
    const existing = await getGitHubFile(filePath)
    const result = await saveGitHubFile(
      filePath,
      content,
      `Update ${slug}.mdx`,
      existing?.sha,
    )
    setSaveStatus(result.message)
    if (result.ok) {
      removeDraft(slug)
      setHasDraft(false)
    }
    setTimeout(() => setSaveStatus(null), 4000)
  }, [content, slug])

  if (loading) {
    return (
      <div style={{ padding: '2rem', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
        Loading editor...
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - var(--header-height, 56px))',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.25rem 0.75rem',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <button
          onClick={() => navigate(`/${slug}`)}
          title="Back to note"
          style={{
            padding: '0.25em 0.5em',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-sm)',
            lineHeight: 1,
          }}
        >
          ← Back
        </button>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
          {slug}
        </span>
      </div>
      <EditorToolbar
        title={title}
        hasDraft={hasDraft}
        gitHubConfig={gitHubConfig}
        saveStatus={saveStatus}
        onSaveLocal={handleSaveLocal}
        onDownload={handleDownload}
        onCommit={handleCommit}
        onSettings={() => setSettingsOpen(true)}
      />

      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            flex: showPreview ? 1 : 1,
            overflow: 'auto',
            borderRight: showPreview ? '1px solid var(--border)' : 'none',
          }}
        >
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
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              backgroundColor: 'var(--bg-primary)',
            }}
          >
            <EditorPreview content={content} />
          </div>
        )}
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
        }}
      >
        <button
          onClick={() => setShowPreview((v) => !v)}
          style={{
            padding: '0.4em 1em',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-sm)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      <GitHubSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

function extractTitle(content: string): string | null {
  const match = content.match(/^title:\s*(.+)$/m)
  return match ? match[1].trim() : null
}

function generateTemplate(noteName: string): string {
  const now = new Date().toISOString().split('T')[0]
  return `---
title: ${noteName ?? 'New Note'}
description: 
date: ${now}
---

# ${noteName ?? 'New Note'}

Write your content here...
`
}
