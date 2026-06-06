import { useState, useRef, useEffect } from 'react'

interface ContextMenu {
  x: number
  y: number
  items: { label: string; action: () => void; danger?: boolean }[]
}

export function useContextMenu() {
  const [menu, setMenu] = useState<ContextMenu | null>(null)

  const show = (e: React.MouseEvent, items: ContextMenu['items']) => {
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY, items })
  }

  const hide = () => setMenu(null)

  const menuEl = menu ? (
    <ContextMenuView menu={menu} onClose={hide} />
  ) : null

  return { menuEl, show, hide, isOpen: !!menu }
}

function ContextMenuView({ menu, onClose }: { menu: ContextMenu; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [onClose])

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: menu.x,
        top: menu.y,
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 300,
        minWidth: '140px',
        padding: '0.25rem 0',
      }}
    >
      {menu.items.map((item, i) => (
        <div
          key={i}
          onClick={() => { item.action(); onClose() }}
          style={{
            padding: '0.35rem 0.75rem',
            fontSize: 'var(--font-size-sm)',
            cursor: 'pointer',
            color: item.danger ? '#e74c3c' : 'var(--text-primary)',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {item.label}
        </div>
      ))}
    </div>
  )
}

export interface TreeItemProps {
  label: string
  depth: number
  icon?: string
  selected?: boolean
  onClick?: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  children?: React.ReactNode
  expanded?: boolean
  onToggle?: () => void
  actions?: React.ReactNode
}

export function TreeItem({ label, depth, icon, selected, onClick, onContextMenu, children, expanded, onToggle, actions }: TreeItemProps) {
  const hasChildren = !!children

  return (
    <div>
      <div
        onClick={hasChildren ? onToggle : onClick}
        onContextMenu={onContextMenu}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.25rem 0.5rem',
          paddingLeft: `${0.5 + depth * 1}rem`,
          cursor: 'pointer',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-sm)',
          color: selected ? 'var(--accent)' : 'var(--text-primary)',
          backgroundColor: selected ? 'var(--tag-bg)' : 'transparent',
          userSelect: 'none',
        }}
        onMouseEnter={e => { if (!selected) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)' }}
        onMouseLeave={e => { if (!selected) e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        {hasChildren && (
          <span style={{ fontSize: '0.7rem', width: '0.8rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {expanded ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span style={{ width: '0.8rem' }} />}
        {icon && <span style={{ fontSize: '0.85rem' }}>{icon}</span>}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{label}</span>
        {actions && <span onClick={e => e.stopPropagation()}>{actions}</span>}
      </div>
      {expanded && hasChildren && children}
    </div>
  )
}
