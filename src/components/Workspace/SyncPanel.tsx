import { useState, useEffect } from 'react'
import { type SyncAPI } from '../../hooks/useSync'
import type { WorkspaceAPI } from '../../hooks/useWorkspace'
import { getGitHubConfig } from '../../utils/github'

interface Props {
  sync: SyncAPI
  api: WorkspaceAPI
  onOpenGitHubSettings: () => void
}

export function SyncPanel({ sync, api, onOpenGitHubSettings }: Props) {
  const [ghConfigured, setGhConfigured] = useState(!!getGitHubConfig())
  useEffect(() => {
    const check = () => setGhConfigured(!!getGitHubConfig())
    window.addEventListener('storage', check)
    return () => window.removeEventListener('storage', check)
  }, [])
  const unsynced = Object.values(api.workspace.files).filter(f => f.status !== 'synced').length
  return (
    <div style={{ padding: '0.25rem 0' }}>
      <div style={{ padding: '0.25rem 0.75rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
        SYNC {unsynced > 0 && <span style={{ color: 'var(--accent)', fontWeight: 700 }}>({unsynced} unsynced)</span>}
      </div>

      <div style={{ padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <button
          onClick={() => sync.pushAll(api)}
          disabled={sync.syncing}
          style={syncBtn}
        >
          {sync.syncing ? '⏳ Pushing...' : '⬆ Push All'}
        </button>
        <button
          onClick={() => sync.pullAll(api)}
          disabled={sync.syncing}
          style={syncBtn}
        >
          {sync.syncing ? '⏳ Pulling...' : '⬇ Pull from GitHub'}
        </button>
        <button
          onClick={onOpenGitHubSettings}
          style={{ ...syncBtn, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}
        >
          ⚙ Configure GitHub
        </button>
      </div>

      <div style={{ padding: '0.25rem 0.75rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
        {ghConfigured ? '✓ GitHub configured' : '✗ GitHub not configured — local only'}
      </div>

      {sync.results.length > 0 && (
        <div style={{ marginTop: '0.5rem', maxHeight: '200px', overflow: 'auto' }}>
          {sync.results.map((r, i) => (
            <div
              key={i}
              style={{
                padding: '0.2rem 0.75rem',
                fontSize: 'var(--font-size-xs)',
                color: r.ok ? 'var(--text-secondary)' : '#e74c3c',
              }}
            >
              {r.ok ? '✓' : '✗'} {r.path || r.message}
            </div>
          ))}
          <button
            onClick={sync.clearResults}
            style={{
              ...syncBtn, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)',
              margin: '0.25rem 0.5rem', width: 'auto',
            }}
          >
            Clear
          </button>
        </div>
      )}

      {sync.conflicts.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ padding: '0.25rem 0.75rem', fontSize: 'var(--font-size-xs)', color: '#e74c3c', fontWeight: 600 }}>
            CONFLICTS ({sync.conflicts.length})
          </div>
          {sync.conflicts.map(c => (
            <div key={c.path} style={{ padding: '0.25rem 0.75rem' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)' }}>{c.path}</div>
              <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.15rem' }}>
                <button
                  onClick={() => sync.resolveConflict(c.path, 'local')}
                  style={{
                    ...smallBtn,
                    backgroundColor: c.resolve === 'local' ? 'var(--accent)' : 'var(--bg-primary)',
                    color: c.resolve === 'local' ? '#fff' : 'var(--text-primary)',
                  }}
                >
                  Keep Local
                </button>
                <button
                  onClick={() => sync.resolveConflict(c.path, 'remote')}
                  style={{
                    ...smallBtn,
                    backgroundColor: c.resolve === 'remote' ? 'var(--accent)' : 'var(--bg-primary)',
                    color: c.resolve === 'remote' ? '#fff' : 'var(--text-primary)',
                  }}
                >
                  Keep Remote
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const syncBtn: React.CSSProperties = {
  width: '100%', padding: '0.3em 0.5em', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)', cursor: 'pointer',
  fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-xs)',
  textAlign: 'center',
  opacity: 1,
}

const smallBtn: React.CSSProperties = {
  padding: '0.2em 0.4em', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)', cursor: 'pointer',
  fontFamily: 'var(--font-body)', fontSize: '0.65rem',
}
