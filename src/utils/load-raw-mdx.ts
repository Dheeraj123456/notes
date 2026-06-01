export async function loadRawMdx(slug: string): Promise<string | null> {
  const base = import.meta.env.BASE_URL ?? '/'
  const url = `${base}api/raw-mdx/${slug}.mdx`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}
