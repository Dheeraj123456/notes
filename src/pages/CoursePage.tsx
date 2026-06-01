import { useParams, Link } from 'react-router-dom'
import { getBranch, getCourse, getNotesForCourse } from '../data/content-index'

export function CoursePage() {
  const { branch: branchId, course: courseId } = useParams<{ branch: string; course: string }>()
  const branch = branchId ? getBranch(branchId) : undefined
  const course = branchId && courseId ? getCourse(branchId, courseId) : undefined
  const notes = branchId && courseId ? getNotesForCourse(branchId, courseId) : []

  if (!branch || !course) {
    return (
      <div>
        <h1 style={{ marginTop: 0 }}>Course Not Found</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          The course <strong>{courseId}</strong> does not exist.
        </p>
        <Link to={`/${branchId}`} style={{ color: 'var(--link)' }}>← Back to branch</Link>
      </div>
    )
  }

  const sortedNotes = [...notes].filter((n) => !n.slug.endsWith(`/${courseId}`))

  return (
    <div>
      <h1 style={{ marginTop: 0, fontSize: 'clamp(1.25rem, 5vw, 1.875rem)' }}>
        {course.name}
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>
        {course.description}
      </p>

      {sortedNotes.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No notes yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sortedNotes.map((note) => (
            <Link
              key={note.slug}
              to={`/${note.slug}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 1rem',
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
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>📄</span>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>
                {note.title}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
