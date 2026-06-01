# Engineering Notes Static Site — Implementation Plan

## Overview
Static site for engineering course notes served via GitHub Pages. React + TypeScript + Vite + React Router. Markdown, Mermaid, PlantUML, data visualization. Multiple eye-comfort themes.

## User Choices
| Question | Answer |
|---|---|
| Framework | Vite + React Router + MDX |
| Branches | Computer Science, Data Science, Chemical Engineering |
| Themes | Light, Dark, Sepia, Nord, Dracula — all 5 |
| Diagrams | Client-side rendering (Mermaid, PlantUML) |
| Deployment | Static export to GitHub Pages (custom Node script) |
| Wiki-links | `[[slug]]` → React Router `<Link>`, click navigates in-place |
| Sidebar | Collapsible tree (branch + course level) |
| Search | Filterable with scope: This note, This course, This branch, All content |

---

## Final Folder Structure

```
notes/
├── content/
│   ├── computer-science/
│   │   ├── _branch_.json
│   │   ├── data-structures/
│   │   │   ├── _course_.json
│   │   │   ├── index.md
│   │   │   ├── arrays.md
│   │   │   ├── linked-lists.md
│   │   │   └── trees.md
│   │   └── algorithms/
│   │       └── ...
│   ├── data-science/
│   │   └── ...
│   └── chemical-engineering/
│       └── ...
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   ├── Content/
│   │   │   ├── MarkdownRenderer.tsx
│   │   │   ├── MermaidBlock.tsx
│   │   │   ├── PlantUMLBlock.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   └── MathFormula.tsx
│   │   ├── Theme/
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── Search/
│   │   │   ├── SearchModal.tsx
│   │   │   └── SearchScopePicker.tsx
│   │   └── GraphView.tsx
│   ├── themes/
│   │   ├── variables.css
│   │   ├── light.css
│   │   ├── dark.css
│   │   ├── sepia.css
│   │   ├── nord.css
│   │   └── dracula.css
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   ├── useContent.ts
│   │   ├── useSearch.ts
│   │   └── useSidebar.ts
│   ├── data/
│   │   └── content-index.ts
│   ├── utils/
│   │   ├── mdx.ts
│   │   ├── links.ts
│   │   └── routes.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── BranchPage.tsx
│   │   ├── CoursePage.tsx
│   │   ├── NotePage.tsx
│   │   └── NotFoundPage.tsx
│   ├── App.tsx
│   ├── router.tsx
│   └── main.tsx
├── scripts/
│   ├── build-content-index.ts
│   └── static-export.ts
├── public/
│   └── favicon.svg
├── .github/workflows/
│   └── deploy.yml
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Tech Stack

| Concern | Library |
|---|---|
| Build tool | Vite 6 |
| Framework | React 19 + TypeScript 5 |
| Routing | React Router v7 (data router) |
| MDX | `@mdx-js/rollup` + `remark`/`rehype` |
| Frontmatter | `gray-matter` |
| Mermaid | `mermaid` (client-side) |
| PlantUML | `plantuml-encoder` + web renderer |
| Math | KaTeX |
| Code highlight | Shiki (`rehype-shiki`) |
| Themes | CSS custom properties (5 themes) |
| Search | `minisearch` + Web Worker |
| Data viz | Recharts + D3 (optional) |
| Static export | Custom Node script + `react-dom/static` |

---

## Theme System

5 themes using CSS custom properties on `[data-theme="X"]`:

- **light**: White background, dark text
- **dark**: Dark navy background, light text
- **sepia**: Warm parchment background, brown text — eye-comfortable
- **nord**: Cool blue-grey tones (Arctic-inspired)
- **dracula**: Dark with vibrant accents (code-friendly)

~35 CSS variables per theme covering:
- Backgrounds (primary, secondary, code, sidebar)
- Text (primary, secondary, code, heading, link)
- Accent colors
- Borders, table, blockquote
- Mermaid background
- Typography (font stacks, sizes)
- Spacing, radii, shadows

Code highlighting uses Shiki's `css-variables` theme → code recolors automatically with theme switch.

---

## Static Export (GitHub Pages)

```
npm run build
  ├── 1. scripts/build-content-index.ts   scans content/, generates src/data/content-index.ts
  ├── 2. vite build                       bundles JS/CSS → dist/assets/
  ├── 3. scripts/static-export.ts         pre-renders every route → dist/<path>/index.html
  └── 4. copy index.html as 404.html      for SPA fallback on GH Pages
```

The static export script:
- Imports built index.html template
- Creates static React Router with `staticHandler.query`
- Calls `renderToStaticMarkup` for each route
- Writes one HTML file per route

---

## Search Architecture

MiniSearch index built at build time from all note titles + content excerpts (~few KB, baked into JS bundle). Scope filtering:

- **This note** — ctrl+F within current page text
- **This course** — results from the current course only
- **This branch** — results from the current branch
- **All content** — cross-branch search

Keyboard shortcut: `Ctrl+K` to open search modal.

---

## MDX Processing Pipeline

```
.md file
  → gray-matter (extract frontmatter)
  → remark-frontmatter
  → remark-gfm (tables, strikethrough, checklists)
  → remark-math (LaTeX $$...$$)
  → custom remark-wiki-link ([[slug]] → resolved path)
  → rehype-slug (heading IDs)
  → rehype-katex (math → HTML)
  → rehype-shiki (code → highlighted HTML w/ CSS vars)
  → custom rehype-mermaid (wrap ```mermaid → MermaidBlock)
  → custom rehype-plantuml (wrap ```plantuml → PlantUMLBlock)
  → @mdx-js/rollup → React component
```

---

## GitHub Actions Deploy

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## Implementation Phases

### Phase 1 — Scaffold & Core (1.5 days)
- Initialize Vite + React + TypeScript project
- 5 theme CSS files (variables.css, light/dark/sepia/nord/dracula)
- ThemeProvider + ThemeToggle
- AppShell layout (sidebar + header + content)
- Router skeleton with placeholder pages

### Phase 2 — Content Pipeline (2.5 days)
- content-index generator script
- MDX pipeline (remark/rehype plugins)
- MarkdownRenderer, MermaidBlock, PlantUMLBlock, CodeBlock, MathFormula, WikiLink

### Phase 3 — Pages & Navigation (1.5 days)
- HomePage, BranchPage, CoursePage, NotePage
- Collapsible Sidebar with localStorage state
- Breadcrumbs

### Phase 4 — Static Export & Search (2 days)
- static-export.ts script
- SearchModal + SearchScopePicker (MiniSearch, 4 scopes)
- GitHub Actions deploy workflow
- 404 fallback page

### Phase 5 — Polish (1 day)
- Recharts GraphView
- Keyboard shortcuts
- Responsive mobile layout
- Page transitions
- Print styles

### Phase 6 — Content (1 day)
- Sample content for CS, Data Science, Chemical Engineering
- Cross-links between notes
