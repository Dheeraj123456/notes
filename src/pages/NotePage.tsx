import { useParams, Link } from 'react-router-dom'
import { MarkdownRenderer } from '../components/Content/MarkdownRenderer'

export function NotePage() {
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

  return <MarkdownRenderer slug={slug} />
}
