# Engineering Notes

A static note-taking and publishing platform built with React, TypeScript, and Vite.

## Features

- **MDX Content** — Write notes in Markdown with JSX components, KaTeX math, diagrams, and more.
- **KaTeX** — LaTeX math rendered in the browser.
- **Mermaid** — Flowcharts, sequence diagrams, and other diagrams rendered inline.
- **PlantUML** — UML diagrams rendered on the fly.
- **Wiki Links** — `[[Note Title]]` syntax for cross-linking notes.
- **Code Highlighting** — Syntax highlighting via Shiki with CSS variable themes.
- **Themes** — Light, Dark, Sepia, Nord, and Dracula themes.
- **Search** — Full-text search powered by MiniSearch.
- **Graph View** — Visual graph of note connections.
- **Static Export** — Pre-renders pages for SEO and fast loading via `scripts/static-export.mjs`.

## Getting Started

```bash
npm install
npm run dev
```

The dev server starts at [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

Produces a static export in `dist/`, ready for deployment to GitHub Pages at `/notes/`.

## Project Structure

```
content/          — MDX note files organized by branch/course
  chem/           — Chemistry notes
  cs/             — Computer Science notes
  ds/             — Data Science notes
public/           — Static assets (favicon, etc.)
scripts/
  static-export.mjs  — Static site pre-rendering
src/
  components/
    Content/      — Content rendering components
    GraphView.tsx — Graph visualization
    Layout/       — AppShell, Header, Sidebar, Breadcrumbs
    Search/       — Search UI
    Theme/        — Theme provider and theme switcher
  data/           — Note metadata, graph data generation
  hooks/          — Custom React hooks
  pages/          — Route page components
  themes/         — CSS theme variables
  utils/
    plugins/      — Remark/Rehype plugins (wiki links, mermaid, plantuml)
```

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check, build, and static-export |
| `npm run build:dev` | Build without type-checking |
| `npm run preview` | Preview the built output |
| `npm run lint` | Run ESLint |

## Deployment

Pushes to `main` trigger GitHub Actions to build and deploy to GitHub Pages automatically.
