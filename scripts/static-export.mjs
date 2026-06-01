import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'

const DIST = 'dist'

const htmlPath = join(DIST, 'index.html')
let html

try {
  html = readFileSync(htmlPath, 'utf-8')
} catch {
  console.error('Build output not found at dist/index.html. Run "npm run build:dev" first.')
  process.exit(1)
}

const routes = ['']

function walkContent(dir, routePrefix) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return
  }

  for (const entry of entries) {
    if (entry.startsWith('_')) continue
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      const route = routePrefix + '/' + entry
      routes.push(route)
      walkContent(fullPath, route)
    } else if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
      const slug = entry.replace(/\.(md|mdx)$/, '')
      if (slug === 'index') continue
      const route = routePrefix + '/' + slug
      routes.push(route)
    }
  }
}

walkContent('content', '')

for (const route of routes) {
  const outPath = join(DIST, route, 'index.html')
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, html)
}

copyFileSync(join(DIST, 'index.html'), join(DIST, '404.html'))

writeFileSync(join(DIST, '.nojekyll'), '')
console.log(`Static export: ${routes.length} pages generated`)
