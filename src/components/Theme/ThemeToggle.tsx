import { useThemeContext } from './ThemeProvider'

type Theme = 'light' | 'dark' | 'sepia' | 'nord' | 'dracula'

export function ThemeToggle() {
  const { theme, setTheme, themes } = useThemeContext()

  return (
    <div className="theme-toggle">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        aria-label="Select theme"
        style={{
          padding: '0.3em 0.5em',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
          cursor: 'pointer',
          maxWidth: '36px',
        }}
        title={theme}
      >
        {themes.map((t) => (
          <option key={t} value={t}>
            {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : t === 'sepia' ? '📜' : t === 'nord' ? '❄️' : '🧛'}
          </option>
        ))}
      </select>
    </div>
  )
}
