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

const shikiTheme = createCssVariablesTheme({
  name: 'notes-theme',
  variablePrefix: '--shiki-',
  fontStyle: true,
})

export default defineConfig({
  plugins: [
    react(),
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
