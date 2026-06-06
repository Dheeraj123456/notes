import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllBranches, getCoursesForBranch, getWorkspaceBranches, getWorkspaceCourses } from '../../data/content-index'

interface SidebarProps {
  isOpen: boolean
  onClose?: () => void
}

function EditButton({ href }: { href: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      to={href}
      onClick={(e) => e.stopPropagation()}
      title="Open in Workspace Editor"
      style={{
        width: '1.25rem',
        height: '1.25rem',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        textDecoration: 'none',
        fontSize: '0.65rem',
        cursor: 'pointer',
        opacity: hovered ? 1 : 0,
        color: hovered ? '#fff' : 'var(--text-secondary)',
        backgroundColor: hovered ? 'var(--accent)' : 'transparent',
        transition: 'opacity var(--transition-fast), background-color var(--transition-fast)',
        flexShrink: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      ✏
    </Link>
  )
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [wsBranches, setWsBranches] = useState<{ id: string; name: string }[]>([])
  const [wsCourses, setWsCourses] = useState<Record<string, { id: string; name: string }[]>>({})
  const branches = useMemo(() => getAllBranches(), [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    getWorkspaceBranches().then(extraBranches => {
      setWsBranches(extraBranches)
      const allBranchIds = [...branches.map(b => b.id), ...extraBranches.map(b => b.id)]
      Promise.all(allBranchIds.map(id =>
        getWorkspaceCourses(id).then(cs => ({ id, courses: cs }))
      )).then(results => {
        const map: Record<string, { id: string; name: string }[]> = {}
        for (const { id, courses } of results) {
          if (courses.length > 0) map[id] = courses
        }
        setWsCourses(map)
      })
    })
  }, [branches])

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

      {[...branches, ...wsBranches.map(b => ({ ...b, order: 99 }))].sort((a, b) => (a as any).order ?? 99 - (b as any).order ?? 99).map((branch) => {
        const staticCourses = getCoursesForBranch(branch.id)
        const extraCourses = wsCourses[branch.id] || []
        const allCourses = [...staticCourses, ...extraCourses].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
        return (
          <CollapsibleBranch
            key={branch.id}
            label={branch.name}
            href={`/${branch.id}`}
            workspaceHref={`/workspace/${branch.id}`}
            depth={0}
            onClick={handleNav}
          >
            {allCourses.map((course) => (
              <SidebarItem
                key={course.id}
                label={course.name}
                href={`/${branch.id}/${course.id}`}
                workspaceHref={`/workspace/${branch.id}/${course.id}`}
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
  workspaceHref,
  depth,
  onClick,
}: {
  label: string
  href?: string
  workspaceHref?: string
  depth: number
  onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.15rem',
        padding: '0.375rem 0.75rem',
        paddingLeft: `${0.75 + depth * 1.25}rem`,
        borderRadius: 'var(--radius-sm)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        to={href || '#'}
        onClick={onClick}
        style={{
          flex: 1,
          display: 'block',
          cursor: 'pointer',
          color: href ? 'var(--link)' : 'var(--sidebar-text)',
          fontWeight: href ? 400 : 600,
          fontSize: 'var(--font-size-sm)',
          textDecoration: 'none',
        }}
      >
        {label}
      </Link>
      {workspaceHref && <EditButton href={workspaceHref} />}
    </div>
  )
}

function CollapsibleBranch({
  label,
  href,
  workspaceHref,
  depth,
  children,
  onClick,
}: {
  label: string
  href?: string
  workspaceHref?: string
  depth: number
  children: React.ReactNode
  onClick?: () => void
}) {
  const [expanded, setExpanded] = useState(depth < 1)
  const [hovered, setHovered] = useState(false)
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
        onMouseEnter={(e) => {
          setHovered(true)
          ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--sidebar-hover-bg)'
        }}
        onMouseLeave={(e) => {
          setHovered(false)
          ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
        }}
        onClick={() => {
          if (hasChildren) setExpanded(!expanded)
          else if (href && onClick) {
            onClick()
            window.location.href = href
          }
        }}
      >
        {hasChildren && (
          <span style={{ fontSize: '0.65rem', width: '1em', textAlign: 'center', flexShrink: 0, transition: 'transform var(--transition-fast)' }}>
            {expanded ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span style={{ width: '1em', flexShrink: 0 }} />}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {label}
        </span>
        {workspaceHref && <EditButton href={workspaceHref} />}
      </div>
      {hasChildren && expanded && (
        <div>
          {href && (
            <SidebarItem label={`📋 ${label}`} href={href} workspaceHref={workspaceHref} depth={depth + 1} onClick={onClick} />
          )}
          {children}
        </div>
      )}
    </div>
  )
}
