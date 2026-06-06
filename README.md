# Engineering Notes

A static note-taking and publishing platform built with React, TypeScript, and Vite. Write notes locally in MDX, publish to GitHub Pages with one push, and edit online via the built-in editor.

> **📖 Creating content?** See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide on branches, courses, notes, diagrams, and the workspace editor.

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
- **Online Editor** — Edit notes directly in the browser with a split-pane markdown editor. Save as draft locally, download `.mdx`, or commit to GitHub via a Personal Access Token.
- **Static Export** — Pre-renders pages for SEO and fast loading.

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

Produces a static export in `dist/`, ready for deployment to GitHub Pages.

## Online Editor

The built-in editor at `/editor/:branch/:course/:note` lets you create and edit notes directly in the browser:

- **Save Local** — saves a draft to browser localStorage (persists across sessions)
- **Download** — downloads the note as `.mdx` file
- **Commit to GitHub** — commits directly to your repo via the GitHub Content API (requires a PAT)
- **GitHub Settings** — configure your PAT, owner, repo, and branch
- **Preview** — toggle a live preview panel with Mermaid, PlantUML, and GraphView rendering

Click "Edit" on any note page to open it in the editor, or use the "+ New Note" button on a course page.

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
    Editor/       — Online editor components
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
| `npm run build` | Build and static-export for GitHub Pages |
| `npm run build:dev` | Build without static export |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run preview` | Preview the built output |
| `npm run lint` | Run ESLint |

## Deployment to GitHub Pages

### Option 1: GitHub Actions (automatic)

The included `.github/workflows/deploy.yml` builds and deploys to GitHub Pages automatically on every push to `main`.

**Setup:**
1. Push this repo to GitHub.
2. Go to **Settings > Pages** of your GitHub repo.
3. Under **Source**, select **GitHub Actions**.
4. The next push to `main` will automatically build and deploy.

Your site will be available at `https://<username>.github.io/<repo-name>/`.

### Option 2: Manual deployment

```bash
npm run build
```

This produces the static site in `dist/`. Push the `dist/` folder to the `gh-pages` branch or use any static hosting service.

### Repo name and base path

The site is built with `--base=/notes/` (matching the repo name). If your repo is named differently, update the `--base` flag in `package.json`:

```json
"build": "vite build --base=/<your-repo-name>/ && node scripts/static-export.mjs"
```

### Using the online editor with GitHub

1. Go to **GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)**
2. Generate a token with `repo` scope.
3. Open your deployed site, click the ⚙ button in the editor toolbar.
4. Enter your token, repository owner, repository name, and branch (e.g., `main`).
5. Click **Test Connection**, then **Save**.

> Your PAT is stored in localStorage and never sent anywhere except GitHub's API.
