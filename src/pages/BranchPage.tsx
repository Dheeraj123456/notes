import { useParams, Link } from 'react-router-dom'
import { getBranch, getCoursesForBranch } from '../data/content-index'

export function BranchPage() {
  const { branch: branchId } = useParams<{ branch: string }>()
  const branch = branchId ? getBranch(branchId) : undefined
  const courses = branchId ? getCoursesForBranch(branchId) : []

  if (!branch) {
    return (
      <div>
        <h1 style={{ marginTop: 0 }}>Branch Not Found</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          The branch <strong>{branchId}</strong> does not exist.
        </p>
        <Link to="/" style={{ color: 'var(--link)' }}>← Back to Home</Link>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ marginTop: 0, fontSize: 'clamp(1.25rem, 5vw, 1.875rem)' }}>
        {branch.icon} {branch.name}
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>
        {branch.description}
      </p>

      {courses.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No courses yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/${branchId}/${course.id}`}
              style={{
                display: 'block',
                padding: 'clamp(1rem, 3vw, 1.25rem)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--card-bg)',
                textDecoration: 'none',
                transition: 'box-shadow var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              <h3 style={{ margin: '0 0 0.25rem', fontSize: 'clamp(1rem, 3vw, 1.125rem)' }}>
                {course.name}
              </h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'clamp(0.8rem, 2.5vw, 0.875rem)' }}>
                {course.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
