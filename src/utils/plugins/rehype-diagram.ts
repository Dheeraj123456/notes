import { visit } from 'unist-util-visit'
import type { Root, Element, Text } from 'hast'
import yaml from 'js-yaml'

function hasClassName(node: Element, name: string): boolean {
  const className = node.properties?.className
  if (Array.isArray(className)) return className.includes(name)
  return className === name
}

export function rehypeDiagram() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (
        node.tagName === 'pre' &&
        node.children?.length === 1 &&
        node.children[0].type === 'element' &&
        (node.children[0] as Element).tagName === 'code' &&
        hasClassName(node.children[0] as Element, 'language-diagram')
      ) {
        const codeEl = node.children[0] as Element
        const codeText = (codeEl.children?.[0] as Text)?.value ?? ''

        try {
          const parsed = yaml.load(codeText) as Record<string, unknown>
          const diagramType = parsed.type as string
          const data = parsed.data ?? Object.fromEntries(
            Object.entries(parsed).filter(([k]) => k !== 'type')
          )

          if (['flow', 'tree', 'network', 'venn', 'bar', 'line'].includes(diagramType)) {
            const diagramDiv: Element = {
              type: 'element',
              tagName: 'div',
              properties: {
                className: ['diagram-block'],
                dataDiagram: JSON.stringify({ type: diagramType, data }),
              },
              children: [],
            }

            if (parent && typeof index === 'number') {
              parent.children[index] = diagramDiv
            }
          }
        } catch {
          // invalid YAML, leave as-is
        }
      }
    })
  }
}
