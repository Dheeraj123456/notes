import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
      <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem' }}>
        Page not found.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          padding: '0.6em 1.5em',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--accent)',
          color: 'var(--text-inverse)',
          textDecoration: 'none',
          fontWeight: 500,
        }}
      >
        ← Back to Home
      </Link>
    </div>
  )
}
