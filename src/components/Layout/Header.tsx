import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../Theme/ThemeToggle'
import { SearchModal } from '../Search/SearchModal'

interface HeaderProps {
  onToggleSidebar: () => void
  sidebarOpen?: boolean
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header
        style={{
          height: 'var(--header-height)',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 0.75rem',
          paddingRight: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.35em 0.45em',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontSize: '1.15rem',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            ☰
          </button>
          <Link
            to="/"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(0.95rem, 3vw, 1.125rem)',
              color: 'var(--heading)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Engineering Notes
          </Link>
          <Link
            to="/workspace"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              padding: '0.2em 0.5em',
              borderRadius: 'var(--radius-sm)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            ✏️ Workspace
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search (Ctrl+K)"
            title="Search (Ctrl+K)"
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.35em 0.6em',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3em',
            }}
          >
            <span>🔍</span>
            <span className="hide-mobile" style={{ color: 'var(--text-muted)' }}>
              Search
            </span>
            <kbd
              className="hide-mobile"
              style={{
                fontSize: '0.65rem',
                padding: '0.1em 0.35em',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              Ctrl+K
            </kbd>
          </button>
          <ThemeToggle />
        </div>
      </header>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
