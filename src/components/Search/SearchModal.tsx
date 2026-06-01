import { useState, useEffect, useRef, type KeyboardEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSearch, type SearchScope } from '../../hooks/useSearch'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<SearchScope>('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const params = useParams()

  const currentBranch = params.branch
  const currentCourse = params.course

  const { results } = useSearch(query, scope, currentBranch, currentCourse)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          setQuery('')
          onClose()
          setTimeout(() => inputRef.current?.focus(), 50)
        }
      }
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSelect = (path: string) => {
    navigate(path)
    onClose()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      const first = results[0] as Record<string, unknown>
      const path = first.path as string
      if (path) handleSelect(path)
    }
  }

  const scopes: { value: SearchScope; label: string }[] = [
    { value: 'all', label: 'All Content' },
    ...(currentBranch ? [{ value: 'branch' as const, label: `Branch: ${currentBranch}` }] : []),
    ...(currentBranch && currentCourse ? [{ value: 'course' as const, label: `Course: ${currentCourse}` }] : []),
  ]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--overlay-bg)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 'clamp(2vh, 10vh, 8rem)',
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          width: 'min(600px, 100%)',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.6rem',
            borderBottom: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search notes..."
            aria-label="Search notes"
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '0.5em 0.75em',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-base)',
            }}
          />
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as SearchScope)}
            aria-label="Search scope"
            style={{
              padding: '0.5em 0.6em',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            {scopes.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ maxHeight: '50vh', overflowY: 'auto', padding: '0.25rem' }}>
          {query.trim() && results.length === 0 && (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              No results found for "{query}"
            </div>
          )}
          {results.map((result) => {
            const r = result as Record<string, unknown>
            return (
              <div
                key={r.id as string}
                onClick={() => handleSelect(r.path as string)}
                style={{
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'background-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--sidebar-hover-bg)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '0.15rem' }}>
                  {r.title as string}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {r.description as string}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {r.path as string}
                </div>
              </div>
            )
          })}
        </div>

        <div
          className="hide-mobile"
          style={{
            padding: '0.4rem 0.75rem',
            borderTop: '1px solid var(--border)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{results.length} results</span>
          <span>↑↓ navigate · Enter open · Esc close</span>
        </div>
      </div>
    </div>
  )
}
