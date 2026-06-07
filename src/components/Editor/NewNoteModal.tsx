import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

interface Props {
  open: boolean
  onClose: () => void
  branch: string
  course: string
}

export function NewNoteModal({ open, onClose, branch, course }: Props) {
  const [noteName, setNoteName] = useState('')
  const navigate = useNavigate()

  if (!open) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const slug = noteName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    if (!slug) return
    onClose()
    navigate(`/workspace/${branch}/${course}/${slug}`)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--overlay-bg)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: 'min(400px, 100%)',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.5rem',
        }}
      >
        <h2 style={{ margin: '0 0 0.5rem', fontSize: 'var(--font-size-xl)' }}>
          New Note
        </h2>
        <p style={{ margin: '0 0 1rem', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
          Course: {branch}/{course}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={noteName}
            onChange={(e) => setNoteName(e.target.value)}
            placeholder="Note title"
            required
            autoFocus
            style={{
              width: '100%',
              padding: '0.5em 0.75em',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-md)',
              boxSizing: 'border-box',
              marginBottom: '1rem',
            }}
          />

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.4em 0.9em',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
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
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
