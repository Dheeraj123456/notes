import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import rehypeShiki from '@shikijs/rehype'
import { createCssVariablesTheme } from 'shiki'
import { remarkWikiLink } from './src/utils/plugins/remark-wiki-link'
import { rehypeMermaid } from './src/utils/plugins/rehype-mermaid'
import { rehypePlantuml } from './src/utils/plugins/rehype-plantuml'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const shikiTheme = createCssVariablesTheme({
  name: 'notes-theme',
  variablePrefix: '--shiki-',
  fontStyle: true,
})

function rawMdxPlugin(): import('vite').Plugin {
  const contentDir = path.resolve(__dirname, 'content')

  function serveRaw(req: any, res: any, next: any) {
    const url = req.url ?? ''
    const match = url.match(/\/api\/raw-mdx\/(.+)\.mdx$/)
    if (!match) return next()
    const filePath = path.resolve(contentDir, match[1] + '.mdx')
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end(content)
    } catch {
      res.statusCode = 404
      res.end('Not found')
    }
  }

  return {
    name: 'raw-mdx',
    configureServer(server) {
      server.middlewares.use(serveRaw)
    },
    generateBundle() {
      // Copy .mdx files to dist/api/raw-mdx/ during build
      const outDir = path.resolve(__dirname, 'dist', 'api', 'raw-mdx')
      function walk(dir: string) {
        let entries: string[]
        try { entries = fs.readdirSync(dir) } catch { return }
        for (const entry of entries) {
          if (entry.startsWith('_')) continue
          const full = path.join(dir, entry)
          const stat = fs.statSync(full)
          if (stat.isDirectory()) {
            walk(full)
          } else if (entry.endsWith('.mdx') || entry.endsWith('.md')) {
            const relPath = path.relative(contentDir, full)
            const dest = path.resolve(outDir, relPath)
            fs.mkdirSync(path.dirname(dest), { recursive: true })
            fs.copyFileSync(full, dest)
          }
        }
      }
      walk(contentDir)
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    rawMdxPlugin(),
    mdx({
      remarkPlugins: [
        remarkFrontmatter,
        remarkMdxFrontmatter,
        remarkGfm,
        remarkMath,
        remarkWikiLink,
      ],
      rehypePlugins: [
        rehypeSlug,
        rehypeKatex,
        rehypeMermaid,
        rehypePlantuml,
        [rehypeShiki, { theme: shikiTheme }],
      ],
      providerImportSource: '@mdx-js/react',
    }),
  ],
  base: '',
  build: {
    outDir: 'dist',
  },
})
