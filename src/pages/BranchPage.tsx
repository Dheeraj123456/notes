import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getBranch, getCoursesForBranch, getWorkspaceCourses } from '../data/content-index'

function CourseCard({ branchId, course }: { branchId: string; course: { id: string; name: string; description: string } }) {
  const [showEdit, setShowEdit] = useState(false)

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setShowEdit(true)}
      onMouseLeave={() => setShowEdit(false)}
    >
      <Link
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
      <Link
        to={`/workspace/${branchId}/${course.id}`}
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
          const el = e.currentTarget as HTMLElement
          el.style.backgroundColor = 'var(--accent)'
          el.style.color = '#fff'
          el.style.borderColor = 'var(--accent)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.backgroundColor = 'var(--bg-secondary)'
          el.style.color = 'var(--text-secondary)'
          el.style.borderColor = 'var(--border)'
        }}
      >
        ✏
      </Link>
    </div>
  )
}

export function BranchPage() {
  const navigate = useNavigate()
  const { branch: branchId } = useParams<{ branch: string }>()
  const branch = branchId ? getBranch(branchId) : undefined
  const [courses, setCourses] = useState(branchId ? getCoursesForBranch(branchId) : [])

  useEffect(() => {
    if (!branchId) return
    getWorkspaceCourses(branchId).then(wsCourses => {
      if (wsCourses.length > 0) {
        setCourses(prev => {
          const merged = [...prev, ...wsCourses]
          merged.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
          return merged
        })
      }
    })
  }, [branchId])

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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.25rem, 5vw, 1.875rem)' }}>
            {branch.icon} {branch.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem', fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>
            {branch.description}
          </p>
        </div>
        <button
          onClick={() => navigate(`/workspace/${branchId}`)}
          title="Create course in Workspace"
          style={{
            padding: '0.4em 0.9em',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--accent)',
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-sm)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          + New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>
          No courses yet.{' '}
          <Link to={`/workspace/${branchId}`} style={{ color: 'var(--link)' }}>
            Create one in Workspace
          </Link>
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {courses.map((course) => (
            <CourseCard key={course.id} branchId={branchId!} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}
