import { Link } from 'react-router-dom'
import { getAllBranches } from '../data/content-index'

const colors = ['#58a6ff', '#3fb950', '#d29922', '#f0883e', '#db6d28', '#a371f7']

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
          <Link
            key={branch.id}
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
                backgroundColor: (colors[i % colors.length]) + '22',
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
        ))}
      </div>
    </div>
  )
}
