import { visit } from 'unist-util-visit'
import type { Root, Text, Link, Paragraph, PhrasingContent } from 'mdast'

interface WikiLinkOptions {
  resolveSlug?: (slug: string) => string | undefined
}

export function remarkWikiLink(options?: WikiLinkOptions) {
  const resolveSlug = options?.resolveSlug ?? ((slug: string) => `/${slug}`)

  return (tree: Root) => {
    visit(tree, 'paragraph', (node: Paragraph) => {
      let i = 0
      while (i < node.children.length) {
        const child = node.children[i]
        if (child.type !== 'text') { i++; continue }

        const text = child.value
        const regex = /\[\[([^\]|]+)(?:\|([^\]|]+))?\]\]/
        const match = text.match(regex)
        if (!match) { i++; continue }

        const [fullMatch, slug, displayText] = match
        const before = text.slice(0, match.index)
        const after = text.slice(match.index! + fullMatch.length)
        const linkText = displayText ?? slug

        const resolvedPath = resolveSlug(slug.trim())
        const url = resolvedPath ?? `/${slug.trim()}`

        const newChildren: PhrasingContent[] = []

        if (before) {
          newChildren.push({ type: 'text', value: before } as Text)
        }

        newChildren.push({
          type: 'link',
          url,
          title: null,
          children: [{ type: 'text', value: linkText } as Text],
        } as Link)

        if (after) {
          newChildren.push({ type: 'text', value: after } as Text)
        }

        node.children.splice(i, 1, ...newChildren)
        i += newChildren.length
      }
    })
  }
}
