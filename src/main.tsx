import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'katex/dist/katex.min.css'
import './index.css'
import App from './App'

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (err) {
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = `<pre style="color:red;padding:2rem;white-space:pre-wrap">Error: ${err instanceof Error ? err.message + '\n\n' + err.stack : String(err)}</pre>`
  }
  console.error('Render error:', err)
}
