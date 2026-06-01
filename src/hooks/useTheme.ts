import { useState, useCallback, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'sepia' | 'nord' | 'dracula'

const STORAGE_KEY = 'notes-theme'
const DEFAULT_THEME: Theme = 'light'

const themes: Theme[] = ['light', 'dark', 'sepia', 'nord', 'dracula']

function getInitialTheme(): Theme {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored && themes.includes(stored)) return stored
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  }
  return DEFAULT_THEME
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
  }, [])

  const cycleTheme = useCallback(() => {
    const idx = themes.indexOf(theme)
    setThemeState(themes[(idx + 1) % themes.length])
  }, [theme])

  return { theme, setTheme, cycleTheme, themes }
}
