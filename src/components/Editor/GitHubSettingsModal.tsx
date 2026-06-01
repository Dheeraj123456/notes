import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { getGitHubConfig, setGitHubConfig, clearGitHubConfig, testConnection } from '../../utils/github'

interface Props {
  open: boolean
  onClose: () => void
}

export function GitHubSettingsModal({ open, onClose }: Props) {
  const existing = getGitHubConfig()
  const [token, setToken] = useState(existing?.token ?? '')
  const [owner, setOwner] = useState(existing?.owner ?? '')
  const [repo, setRepo] = useState(existing?.repo ?? '')
  const [branch, setBranch] = useState(existing?.branch ?? 'main')
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    if (open) {
      const cfg = getGitHubConfig()
      setToken(cfg?.token ?? '')
      setOwner(cfg?.owner ?? '')
      setRepo(cfg?.repo ?? '')
      setBranch(cfg?.branch ?? 'main')
      setStatus(null)
    }
  }, [open])

  const handleTest = useCallback(async () => {
    setTesting(true)
    setStatus(null)
    const result = await testConnection({ token, owner, repo, branch })
    setStatus(result)
    setTesting(false)
  }, [token, owner, repo, branch])

  const handleSave = useCallback((e: FormEvent) => {
    e.preventDefault()
    setGitHubConfig({ token, owner, repo, branch })
    onClose()
  }, [token, owner, repo, branch, onClose])

  const handleClear = useCallback(() => {
    clearGitHubConfig()
    setToken('')
    setOwner('')
    setRepo('')
    setBranch('main')
    setStatus(null)
  }, [])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--overlay-bg)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: 'min(460px, 100%)',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.5rem',
        }}
      >
        <h2 style={{ margin: '0 0 1rem', fontSize: 'var(--font-size-xl)' }}>
          GitHub Settings
        </h2>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Personal Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_..."
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Repository Owner
            </label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="username"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Repository Name
            </label>
            <input
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="repo-name"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Branch
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              style={inputStyle}
            />
          </div>

          {status && (
            <div style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              backgroundColor: status.ok ? 'var(--tag-bg)' : '#f8514911',
              color: status.ok ? 'var(--tag-text)' : '#f85149',
            }}>
              {status.message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={handleClear} style={btnStyle}>Clear</button>
            <button type="button" onClick={handleTest} disabled={testing} style={btnStyle}>
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            <button type="submit" style={{ ...btnStyle, backgroundColor: 'var(--accent)', color: '#fff' }}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputStyle: Record<string, string | number> = {
  width: '100%',
  padding: '0.5em 0.75em',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--font-size-sm)',
  boxSizing: 'border-box',
}

const btnStyle: Record<string, string | number> = {
  padding: '0.4em 0.9em',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--font-size-sm)',
}
