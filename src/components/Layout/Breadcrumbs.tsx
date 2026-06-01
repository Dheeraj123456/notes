import { useLocation } from 'react-router-dom'
import { getAllBranches, getCoursesForBranch } from '../../data/content-index'

const labelCache = new Map<string, string>()

function buildLabelCache(): Map<string, string> {
  if (labelCache.size > 0) return labelCache

  labelCache.set('', 'Home')

  const branches = getAllBranches()
  for (const branch of branches) {
    labelCache.set(branch.id, branch.name)
    const courses = getCoursesForBranch(branch.id)
    for (const course of courses) {
      labelCache.set(`${branch.id}/${course.id}`, course.name)
    }
  }

  return labelCache
}

export function Breadcrumbs() {
  const location = useLocation()
  buildLabelCache()

  const path = location.pathname.replace(/^\//, '').replace(/\/$/, '')
  const segments = path.split('/').filter(Boolean)

  if (segments.length === 0) return null

  const crumbs = [
    { label: 'Home', path: '/' },
    ...segments.map((_, i) => {
      const segPath = segments.slice(0, i + 1).join('/')
      const label = labelCache.get(segPath) ??
        segments[i].replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
      return { label, path: '/' + segPath }
    }),
  ]

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        padding: '0.35rem 0',
        marginBottom: '0.75rem',
        fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        lineHeight: 1.8,
      }}
    >
      {crumbs.map((crumb, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
          {i > 0 && (
            <span style={{ margin: '0 0.3em', color: 'var(--text-muted)', flexShrink: 0 }}>/</span>
          )}
          {i < crumbs.length - 1 ? (
            <a
              href={crumb.path}
              style={{
                color: 'var(--link)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: i === crumbs.length - 2 ? '200px' : undefined,
              }}
            >
              {crumb.label}
            </a>
          ) : (
            <span
              style={{
                color: 'var(--text-primary)',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '250px',
              }}
            >
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
