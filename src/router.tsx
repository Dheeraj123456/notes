import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './components/Layout/AppShell'
import { HomePage } from './pages/HomePage'

function Layout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}

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
    path: '*',
    lazy: () => import('./pages/NotFoundPage').then(m => ({
      Component: function NotFoundRoute() { return <Layout><m.NotFoundPage /></Layout> },
    })),
  },
])
