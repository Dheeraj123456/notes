import { useState } from 'react'

const TEMPLATES = [
  { id: 'frontmatter', label: 'Note with frontmatter' },
  { id: 'blank', label: 'Blank' },
  { id: 'mermaid', label: 'Note with Mermaid diagram' },
  { id: 'latex', label: 'Note with LaTeX math' },
  { id: 'svg', label: 'Note with SVG diagram' },
  { id: 'diagram', label: 'Note with interactive Diagram' },
]

interface Props {
  open: boolean
  onConfirm: (filename: string, templateType: string) => void
  onCancel: () => void
}

export function NewFileDialog({ open, onConfirm, onCancel }: Props) {
  const [name, setName] = useState('')
  const [template, setTemplate] = useState('frontmatter')

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      const filename = name.trim().replace(/\s+/g, '-').replace(/\.mdx?$/, '') + '.mdx'
      onConfirm(filename, template)
      setName('')
    }
  }

  return (
    <div style={overlay}>
      <form onSubmit={handleSubmit} style={modal}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: 'var(--font-size-base)' }}>New File</h3>

        <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
          Filename
        </label>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="my-note"
          style={input}
        />

        <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', display: 'block', marginTop: '0.75rem', marginBottom: '0.25rem' }}>
          Template
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {TEMPLATES.map(t => (
            <label key={t.id} style={{ fontSize: 'var(--font-size-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <input
                type="radio"
                name="template"
                value={t.id}
                checked={template === t.id}
                onChange={() => setTemplate(t.id)}
              />
              {t.label}
            </label>
          ))}
        </div>

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
