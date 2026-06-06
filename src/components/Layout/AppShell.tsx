import { useState, useEffect, type ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Breadcrumbs } from './Breadcrumbs'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [isMobile])

  const sidebarOverlay = isMobile ? (
    <div
      onClick={() => setSidebarOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--overlay-bg)',
        zIndex: 89,
        opacity: sidebarOpen ? 1 : 0,
        visibility: sidebarOpen ? 'visible' : 'hidden',
        transition: 'opacity var(--transition-base), visibility var(--transition-base)',
      }}
    />
  ) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
      />
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {sidebarOverlay}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main
            style={{
              flex: 1,
              marginLeft: !isMobile && sidebarOpen ? 'var(--sidebar-width)' : 0,
              transition: 'margin-left var(--transition-base)',
              padding: isMobile ? '1rem 1rem' : '1.5rem 2rem',
              maxWidth: 'var(--content-max-width)',
              minWidth: 0,
              overflowX: 'hidden',
              wordBreak: 'break-word',
            }}
          >
          <Breadcrumbs />
          {children}
          <footer
            style={{
              marginTop: '3rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            &copy; {new Date().getFullYear()} Dheeraj Kumar Vishwakarma. All content on this site is for educational purposes.
          </footer>
        </main>
      </div>
    </div>
  )
}
