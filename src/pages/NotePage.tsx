import { useParams, Link, useNavigate } from 'react-router-dom'
import { MarkdownRenderer } from '../components/Content/MarkdownRenderer'

export function NotePage() {
  const navigate = useNavigate()
  const { branch, course, note } = useParams<{ branch: string; course: string; note: string }>()
  const slug = [branch, course, note].filter(Boolean).join('/')

  if (!slug) {
    return (
      <div>
        <h1>Note Not Found</h1>
        <Link to="/" style={{ color: 'var(--link)' }}>← Back to Home</Link>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => navigate(`/editor/${slug}`)}
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
          Edit
        </button>
      </div>
      <MarkdownRenderer slug={slug} />
    </div>
  )
}
