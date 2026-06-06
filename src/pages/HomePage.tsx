import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllBranches } from '../data/content-index'

const colors = ['#58a6ff', '#3fb950', '#d29922', '#f0883e', '#db6d28', '#a371f7']

function BranchCard({ branch, color }: { branch: { id: string; name: string; description: string; icon?: string }; color: string }) {
  const [showEdit, setShowEdit] = useState(false)

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setShowEdit(true)}
      onMouseLeave={() => setShowEdit(false)}
    >
      <Link
        to={`/${branch.id}`}
        style={{
          display: 'block',
          padding: 'clamp(1rem, 3vw, 1.5rem)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--card-border)',
          backgroundColor: 'var(--card-bg)',
          textDecoration: 'none',
          transition: 'box-shadow var(--transition-fast), transform var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.boxShadow = 'var(--shadow-md)'
          el.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.boxShadow = 'none'
          el.style.transform = 'none'
        }}
      >
        <div
          style={{
            width: 'clamp(2.5rem, 8vw, 3rem)',
            height: 'clamp(2.5rem, 8vw, 3rem)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: color + '22',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
            fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
          }}
        >
          {branch.icon ?? branch.name[0]}
        </div>
        <h3 style={{ margin: '0 0 0.35rem', fontSize: 'clamp(1rem, 3vw, 1.125rem)' }}>
          {branch.name}
        </h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'clamp(0.8rem, 2.5vw, 0.875rem)' }}>
          {branch.description}
        </p>
      </Link>
      <a
        href={`/workspace/${branch.id}`}
        onClick={(e) => e.stopPropagation()}
        title="Open in Workspace Editor"
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          width: '1.75rem',
          height: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          textDecoration: 'none',
          color: 'var(--text-secondary)',
          fontSize: '0.8rem',
          cursor: 'pointer',
          opacity: showEdit ? 0.85 : 0,
          transition: 'opacity var(--transition-fast), background-color var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget
          el.style.backgroundColor = color
          el.style.color = '#fff'
          el.style.borderColor = color
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget
          el.style.backgroundColor = 'var(--bg-secondary)'
          el.style.color = 'var(--text-secondary)'
          el.style.borderColor = 'var(--border)'
        }}
      >
        ✏
      </a>
    </div>
  )
}

export function HomePage() {
  const branches = getAllBranches()

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Engineering Notes</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>
        A collection of engineering course notes across multiple branches.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
          gap: 'clamp(0.75rem, 2vw, 1rem)',
        }}
      >
        {branches.map((branch, i) => (
          <BranchCard key={branch.id} branch={branch} color={colors[i % colors.length]} />
        ))}
      </div>
    </div>
  )
}
