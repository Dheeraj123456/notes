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
  onDelete?: () => void
  onBack?: () => void
  onDrawIo?: () => void
  onAiAssistant?: () => void
  fileChanged?: boolean
  isMobile?: boolean
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
  onDelete,
  onBack,
  onDrawIo,
  onAiAssistant,
  fileChanged,
  isMobile,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.35rem 0.75rem',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}
    >
      {onBack && (
        <button onClick={onBack} title="Back" style={{
          padding: '0.35em 0.6em', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm)',
          lineHeight: 1, whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {isMobile ? '←' : '← Back'}
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1, minWidth: 0 }}>
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
              flexShrink: 0,
            }}
          >
            Draft
          </span>
        )}
        {fileChanged && (
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: '#e67e22',
              backgroundColor: 'var(--tag-bg)',
              padding: '0.15em 0.5em',
              borderRadius: 'var(--radius-sm)',
              flexShrink: 0,
            }}
          >
            {isMobile ? 'Mod' : 'Modified'}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        {saveStatus && (
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            {saveStatus}
          </span>
        )}

        {isMobile ? (
          <>
            <ToolbarButton onClick={onAiAssistant} compact title="AI Assistant">🤖</ToolbarButton>
            <ToolbarButton onClick={onSaveLocal} compact>💾</ToolbarButton>
            <ToolbarButton onClick={onDownload} compact>⬇</ToolbarButton>
            <ToolbarButton onClick={onCommit} disabled={!gitHubConfig} title={!gitHubConfig ? 'Configure GitHub first' : undefined} compact>
              ⬆
            </ToolbarButton>
            {onDrawIo && (
              <ToolbarButton onClick={onDrawIo} title="Open draw.io diagram editor" compact>📊</ToolbarButton>
            )}
            {onDelete && (
              <ToolbarButton onClick={onDelete} title="Delete file" compact>🗑</ToolbarButton>
            )}
            <ToolbarButton onClick={onSettings} title="GitHub Settings" compact>⚙</ToolbarButton>
          </>
        ) : (
          <>
            <ToolbarButton onClick={onAiAssistant} title="AI Assistant">🤖 AI</ToolbarButton>
            <ToolbarButton onClick={onSaveLocal}>Save Local</ToolbarButton>
            <ToolbarButton onClick={onDownload}>Download</ToolbarButton>
            <ToolbarButton onClick={onCommit} disabled={!gitHubConfig} title={!gitHubConfig ? 'Configure GitHub first' : undefined}>
              Commit
            </ToolbarButton>
            {onDrawIo && (
              <ToolbarButton onClick={onDrawIo} title="Open draw.io diagram editor">draw.io</ToolbarButton>
            )}
            {onDelete && (
              <ToolbarButton onClick={onDelete} title="Delete file">🗑</ToolbarButton>
            )}
            <ToolbarButton onClick={onSettings} title="GitHub Settings">⚙</ToolbarButton>
          </>
        )}
      </div>
    </div>
  )
}

function ToolbarButton({ onClick, disabled, title, children, compact }: { onClick: () => void; disabled?: boolean; title?: string; children: React.ReactNode; compact?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: compact ? '0.3em 0.5em' : '0.35em 0.75em',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-primary)',
        color: disabled ? 'var(--text-secondary)' : 'var(--text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: compact ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
        whiteSpace: 'nowrap',
        opacity: disabled ? 0.5 : 1,
        lineHeight: 1.2,
      }}
    >
      {children}
    </button>
  )
}
