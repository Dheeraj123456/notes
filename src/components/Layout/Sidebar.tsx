import { useState, useMemo, useEffect } from 'react'
import { getAllBranches, getCoursesForBranch } from '../../data/content-index'

interface SidebarProps {
  isOpen: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false)
  const branches = useMemo(() => getAllBranches(), [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleNav = () => {
    if (isMobile) onClose?.()
  }

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        maxWidth: isMobile ? '85vw' : undefined,
        height: 'calc(100vh - var(--header-height))',
        position: 'fixed',
        top: 'var(--header-height)',
        left: 0,
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        overflowY: 'auto',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform var(--transition-base)',
        zIndex: 90,
        padding: '0.75rem 0',
        boxShadow: isMobile && isOpen ? 'var(--shadow-lg)' : 'none',
      }}
    >
      <div style={{ padding: '0 0.75rem', marginBottom: '0.75rem' }}>
        <input
          type="text"
          placeholder="Filter..."
          aria-label="Filter sidebar"
          style={{
            width: '100%',
            padding: '0.5em 0.75em',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-sm)',
          }}
        />
      </div>

      <SidebarItem
        label="Home"
        href="/"
        depth={0}
        onClick={handleNav}
      />

      {branches.map((branch) => {
        const courses = getCoursesForBranch(branch.id)
        return (
          <CollapsibleBranch
            key={branch.id}
            label={branch.name}
            href={`/${branch.id}`}
            depth={0}
            onClick={handleNav}
          >
            {courses.map((course) => (
              <SidebarItem
                key={course.id}
                label={course.name}
                href={`/${branch.id}/${course.id}`}
                depth={1}
                onClick={handleNav}
              />
            ))}
          </CollapsibleBranch>
        )
      })}
    </aside>
  )
}

function SidebarItem({
  label,
  href,
  depth,
  onClick,
}: {
  label: string
  href?: string
  depth: number
  onClick?: () => void
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      style={{
        display: 'block',
        padding: '0.375rem 0.75rem',
        paddingLeft: `${0.75 + depth * 1.25}rem`,
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        color: href ? 'var(--link)' : 'var(--sidebar-text)',
        fontWeight: href ? 400 : 600,
        fontSize: 'var(--font-size-sm)',
        textDecoration: 'none',
        transition: 'background-color var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--sidebar-hover-bg)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
      }}
    >
      {label}
    </a>
  )
}

function CollapsibleBranch({
  label,
  href,
  depth,
  children,
  onClick,
}: {
  label: string
  href?: string
  depth: number
  children: React.ReactNode
  onClick?: () => void
}) {
  const [expanded, setExpanded] = useState(depth < 1)
  const hasChildren = children != null

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.375rem 0.75rem',
          paddingLeft: `${0.75 + depth * 1.25}rem`,
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          color: 'var(--sidebar-text)',
          fontWeight: 600,
          fontSize: 'var(--font-size-sm)',
          transition: 'background-color var(--transition-fast)',
          userSelect: 'none',
        }}
        onClick={() => {
          if (hasChildren) setExpanded(!expanded)
          else if (href && onClick) {
            onClick()
            window.location.href = href
          }
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--sidebar-hover-bg)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
        }}
      >
        {hasChildren && (
          <span style={{ fontSize: '0.65rem', width: '1em', textAlign: 'center', flexShrink: 0, transition: 'transform var(--transition-fast)' }}>
            {expanded ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span style={{ width: '1em', flexShrink: 0 }} />}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </div>
      {hasChildren && expanded && (
        <div>
          {href && (
            <SidebarItem label={`📋 ${label}`} href={href} depth={depth + 1} onClick={onClick} />
          )}
          {children}
        </div>
      )}
    </div>
  )
}
