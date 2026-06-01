import { visit } from 'unist-util-visit'
import type { Root, Element, Text } from 'hast'
// @ts-expect-error plantuml-encoder has no types
import { encode } from 'plantuml-encoder'

function hasClassName(node: Element, name: string): boolean {
  const className = node.properties?.className
  if (Array.isArray(className)) {
    return className.includes(name)
  }
  return className === name
}

export function rehypePlantuml() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (
        node.tagName === 'pre' &&
        node.children?.length === 1 &&
        node.children[0].type === 'element' &&
        (node.children[0] as Element).tagName === 'code' &&
        hasClassName(node.children[0] as Element, 'language-plantuml')
      ) {
        const codeEl = node.children[0] as Element
        const codeText = (codeEl.children?.[0] as Text)?.value ?? ''

        const encoded = encode(codeText)

        const plantumlDiv: Element = {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['plantuml-block'],
            dataEncoded: encoded,
            dataSource: codeText,
          },
          children: [
            {
              type: 'element',
              tagName: 'img',
              properties: {
                src: `https://www.plantuml.com/plantuml/svg/${encoded}`,
                alt: 'PlantUML Diagram',
                loading: 'lazy',
                style: 'max-width: 100%; height: auto;',
              },
              children: [],
            },
          ],
        }

        if (parent && typeof index === 'number') {
          parent.children[index] = plantumlDiv
        }
      }
    })
  }
}
