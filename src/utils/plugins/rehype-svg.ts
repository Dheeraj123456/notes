import { visit } from 'unist-util-visit'
import { fromHtml } from 'hast-util-from-html'
import type { Root, Element, Text } from 'hast'

function hasClassName(node: Element, name: string): boolean {
  const className = node.properties?.className
  if (Array.isArray(className)) return className.includes(name)
  return className === name
}

export function rehypeSvg() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (
        node.tagName === 'pre' &&
        node.children?.length === 1 &&
        node.children[0].type === 'element' &&
        (node.children[0] as Element).tagName === 'code' &&
        hasClassName(node.children[0] as Element, 'language-svg')
      ) {
        const codeEl = node.children[0] as Element
        const codeText = (codeEl.children?.[0] as Text)?.value ?? ''

        let svgContent = codeText.trim()
        if (!svgContent.startsWith('<svg') && !svgContent.startsWith('<SVG')) {
          svgContent = `<svg xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`
        }

        try {
          const svgAst = fromHtml(svgContent, { fragment: true, space: 'svg' })

          const wrapper: Element = {
            type: 'element',
            tagName: 'div',
            properties: { className: ['svg-block'] },
            children: svgAst.children,
          }

          if (parent && typeof index === 'number') {
            parent.children[index] = wrapper
          }
        } catch {
          const fallback: Element = {
            type: 'element',
            tagName: 'div',
            properties: { className: ['svg-block', 'svg-error'] },
            children: [{ type: 'text', value: `Invalid SVG: ${svgContent}` }],
          }
          if (parent && typeof index === 'number') {
            parent.children[index] = fallback
          }
        }
      }
    })
  }
}
