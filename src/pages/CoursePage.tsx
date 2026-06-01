import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getBranch, getCourse, getNotesForCourse } from '../data/content-index'
import { NewNoteModal } from '../components/Editor/NewNoteModal'
import { listDrafts } from '../utils/local-draft'

export function CoursePage() {
  const [newNoteOpen, setNewNoteOpen] = useState(false)
  const { branch: branchId, course: courseId } = useParams<{ branch: string; course: string }>()
  const branch = branchId ? getBranch(branchId) : undefined
  const course = branchId && courseId ? getCourse(branchId, courseId) : undefined
  const notes = branchId && courseId ? getNotesForCourse(branchId, courseId) : []

  const sortedNotes = [...notes].filter((n) => !n.slug.endsWith(`/${courseId}`))

  const draftNotes = branchId && courseId ? listDrafts()
    .filter((d) => d.slug.startsWith(`${branchId}/${courseId}/`))
    .filter((d) => !sortedNotes.some((n) => n.slug === d.slug)) : []

  const allItems = [
    ...draftNotes.map((d) => ({
      slug: d.slug,
      title: d.title,
      isDraft: true as const,
    })),
    ...sortedNotes.map((n) => ({
      slug: n.slug,
      title: n.title,
      isDraft: false as const,
    })),
  ]

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

  return (
    <div>
      <h1 style={{ marginTop: 0, fontSize: 'clamp(1.25rem, 5vw, 1.875rem)' }}>
        {course.name}
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>
        {course.description}
      </p>

      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setNewNoteOpen(true)}
          style={{
            padding: '0.4em 0.9em',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--accent)',
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          + New Note
        </button>
      </div>

      {allItems.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No notes yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {allItems.map((item) => (
            <Link
              key={item.slug}
              to={item.isDraft ? `/editor/${item.slug}` : `/${item.slug}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--card-border)',
                backgroundColor: item.isDraft ? 'var(--tag-bg)' : 'var(--card-bg)',
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
                {item.title}
              </span>
              {item.isDraft && (
                <span
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--accent)',
                    backgroundColor: 'var(--bg-primary)',
                    padding: '0.15em 0.5em',
                    borderRadius: 'var(--radius-sm)',
                    marginLeft: 'auto',
                  }}
                >
                  Draft
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      {branchId && courseId && (
        <NewNoteModal
          open={newNoteOpen}
          onClose={() => setNewNoteOpen(false)}
          branch={branchId}
          course={courseId}
        />
      )}
    </div>
  )
}
