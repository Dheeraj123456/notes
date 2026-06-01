import { visit } from 'unist-util-visit'
import type { Root, Element, Text } from 'hast'

function hasClassName(node: Element, name: string): boolean {
  const className = node.properties?.className
  if (Array.isArray(className)) {
    return className.includes(name)
  }
  return className === name
}

export function rehypeMermaid() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (
        node.tagName === 'pre' &&
        node.children?.length === 1 &&
        node.children[0].type === 'element' &&
        (node.children[0] as Element).tagName === 'code' &&
        hasClassName(node.children[0] as Element, 'language-mermaid')
      ) {
        const codeEl = node.children[0] as Element
        const codeText = (codeEl.children?.[0] as Text)?.value ?? ''

        const mermaidPre: Element = {
          type: 'element',
          tagName: 'pre',
          properties: { className: ['mermaid'] },
          children: [{ type: 'text', value: codeText }],
        }

        if (parent && typeof index === 'number') {
          parent.children[index] = mermaidPre
        }
      }
    })
  }
}
