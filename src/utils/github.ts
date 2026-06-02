export interface GitHubConfig {
  token: string
  owner: string
  repo: string
  branch: string
}

const CONFIG_KEY = 'github_config'

export function getGitHubConfig(): GitHubConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return null
    const config = JSON.parse(raw) as GitHubConfig
    return config
  } catch {
    return null
  }
}

export function setGitHubConfig(config: GitHubConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

export function clearGitHubConfig(): void {
  localStorage.removeItem(CONFIG_KEY)
}

interface GitHubContent {
  content: string
  sha: string
}

async function apiRequest(
  config: GitHubConfig,
  method: string,
  path: string,
  body?: unknown,
): Promise<Response> {
  const url = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/${path.replace(/^\//, '')}`
  return fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'opencode-notes-editor',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

export async function testConnection(config: GitHubConfig): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await apiRequest(config, 'GET', '')
    if (res.ok) {
      const data = await res.json()
      return { ok: true, message: `Connected to ${data.full_name}` }
    }
    if (res.status === 401) return { ok: false, message: 'Invalid token' }
    if (res.status === 404) return { ok: false, message: 'Repository not found' }
    return { ok: false, message: `Error ${res.status}` }
  } catch (err) {
    return { ok: false, message: `Network error: ${(err as Error).message}` }
  }
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ''))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

export async function getGitHubFile(
  path: string,
): Promise<{ content: string; sha: string } | null> {
  const config = getGitHubConfig()
  if (!config) return null

  const res = await apiRequest(config, 'GET', `contents/${encodeURIComponent(path)}`)
  if (!res.ok) return null

  const data = (await res.json()) as GitHubContent
  return { content: base64ToUtf8(data.content), sha: data.sha }
}

export async function saveGitHubFile(
  path: string,
  content: string,
  message: string,
  sha?: string,
): Promise<{ ok: boolean; message: string }> {
  const config = getGitHubConfig()
  if (!config) return { ok: false, message: 'GitHub not configured' }

  const body: Record<string, string> = {
    message,
    content: utf8ToBase64(content),
    branch: config.branch,
  }
  if (sha) body.sha = sha

  try {
    const res = await apiRequest(config, 'PUT', `contents/${encodeURIComponent(path)}`, body)
    if (res.ok) return { ok: true, message: 'Saved to GitHub' }
    if (res.status === 409) {
      return { ok: false, message: 'Conflict: file was modified elsewhere. Refresh and try again.' }
    }
    if (res.status === 422) {
      return { ok: false, message: 'Invalid content or path.' }
    }
    const errData = await res.json().catch(() => null)
    return { ok: false, message: errData?.message ?? `Error ${res.status}` }
  } catch (err) {
    return { ok: false, message: `Network error: ${(err as Error).message}` }
  }
}
