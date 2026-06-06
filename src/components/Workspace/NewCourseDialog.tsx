import { useState } from 'react'

interface Props {
  open: boolean
  onConfirm: (name: string) => void
  onCancel: () => void
}

export function NewCourseDialog({ open, onConfirm, onCancel }: Props) {
  const [name, setName] = useState('')

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onConfirm(name.trim().toLowerCase().replace(/\s+/g, '-'))
      setName('')
    }
  }

  return (
    <div style={overlay}>
      <form onSubmit={handleSubmit} style={modal}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: 'var(--font-size-base)' }}>New Course</h3>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Course name (e.g. networking)"
          style={input}
        />
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
          <button type="button" onClick={onCancel} style={btn}>Cancel</button>
          <button type="submit" disabled={!name.trim()} style={btn}>Create</button>
        </div>
      </form>
    </div>
  )
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, backgroundColor: 'var(--overlay-bg)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
}
const modal: React.CSSProperties = {
  backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)',
  padding: '1.25rem', maxWidth: '360px', width: '90%',
  border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)',
}
const input: React.CSSProperties = {
  width: '100%', padding: '0.4em 0.6em', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm)',
  boxSizing: 'border-box',
}
const btn: React.CSSProperties = {
  padding: '0.35em 0.75em', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)', cursor: 'pointer',
  fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm)',
}
