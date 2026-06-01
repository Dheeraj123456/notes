import { type GitHubConfig } from '../../utils/github'

interface Props {
  title: string
  hasDraft: boolean
  gitHubConfig: GitHubConfig | null
  saveStatus: string | null
  onSaveLocal: () => void
  onDownload: () => void
  onCommit: () => void
  onSettings: () => void
}

export function EditorToolbar({
  title,
  hasDraft,
  gitHubConfig,
  saveStatus,
  onSaveLocal,
  onDownload,
  onCommit,
  onSettings,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </span>
        {hasDraft && (
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--accent)',
              backgroundColor: 'var(--tag-bg)',
              padding: '0.15em 0.5em',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Draft
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {saveStatus && (
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)',
            }}
          >
            {saveStatus}
          </span>
        )}

        <ToolbarButton onClick={onSaveLocal}>Save Local</ToolbarButton>
        <ToolbarButton onClick={onDownload}>Download</ToolbarButton>
        <ToolbarButton onClick={onCommit} disabled={!gitHubConfig} title={!gitHubConfig ? 'Configure GitHub first' : undefined}>
          Commit to GitHub
        </ToolbarButton>
        <ToolbarButton onClick={onSettings} title="GitHub Settings">
          ⚙
        </ToolbarButton>
      </div>
    </div>
  )
}

function ToolbarButton({ onClick, disabled, title, children }: { onClick: () => void; disabled?: boolean; title?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: '0.35em 0.75em',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-primary)',
        color: disabled ? 'var(--text-secondary)' : 'var(--text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--font-size-sm)',
        whiteSpace: 'nowrap',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}
