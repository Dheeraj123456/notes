import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './components/Layout/AppShell'
import { HomePage } from './pages/HomePage'

function Layout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><HomePage /></Layout>,
  },
  {
    path: '/:branch',
    lazy: () => import('./pages/BranchPage').then(m => ({
      Component: function BranchRoute() { return <Layout><m.BranchPage /></Layout> },
    })),
  },
  {
    path: '/:branch/:course',
    lazy: () => import('./pages/CoursePage').then(m => ({
      Component: function CourseRoute() { return <Layout><m.CoursePage /></Layout> },
    })),
  },
  {
    path: '/:branch/:course/:note',
    lazy: () => import('./pages/NotePage').then(m => ({
      Component: function NoteRoute() { return <Layout><m.NotePage /></Layout> },
    })),
  },
  {
    path: '/workspace',
    lazy: () => import('./pages/WorkspacePage').then(m => ({
      Component: function WorkspaceRoute() { return <m.WorkspacePage /> },
    })),
  },
  {
    path: '/workspace/:branch',
    lazy: () => import('./pages/WorkspacePage').then(m => ({
      Component: function WorkspaceRoute() { return <m.WorkspacePage /> },
    })),
  },
  {
    path: '/workspace/:branch/:course',
    lazy: () => import('./pages/WorkspacePage').then(m => ({
      Component: function WorkspaceRoute() { return <m.WorkspacePage /> },
    })),
  },
  {
    path: '/workspace/:branch/:course/:note',
    lazy: () => import('./pages/WorkspacePage').then(m => ({
      Component: function WorkspaceRoute() { return <m.WorkspacePage /> },
    })),
  },
  {
    path: '*',
    lazy: () => import('./pages/NotFoundPage').then(m => ({
      Component: function NotFoundRoute() { return <Layout><m.NotFoundPage /></Layout> },
    })),
  },
], { basename })
