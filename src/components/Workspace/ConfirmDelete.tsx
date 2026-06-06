interface Props {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDelete({ open, title, message, onConfirm, onCancel }: Props) {
  if (!open) return null
  return (
    <div style={overlay}>
      <div style={modal}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: 'var(--font-size-base)' }}>{title}</h3>
        <p style={{ margin: '0 0 1rem', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={btn}>Cancel</button>
          <button onClick={onConfirm} style={{ ...btn, backgroundColor: '#e74c3c', color: '#fff', borderColor: '#e74c3c' }}>Delete</button>
        </div>
      </div>
    </div>
  )
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, backgroundColor: 'var(--overlay-bg)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
}
const modal: React.CSSProperties = {
  backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)',
  padding: '1.25rem', maxWidth: '400px', width: '90%',
  border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)',
}
const btn: React.CSSProperties = {
  padding: '0.35em 0.75em', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)', cursor: 'pointer',
  fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm)',
}
