import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { DiagramProps, TreeNode } from './types'

const nodeColors = ['#4ecdc4', '#45b7d1', '#96ceb4', '#6c5ce7', '#fdcb6e']

interface LayoutNode {
  id: string
  label: string
  x: number
  y: number
  color: string
  children: LayoutNode[]
  parent?: { x: number; y: number }
}

function layoutTree(node: TreeNode, depth: number, offset: { x: number; colors: string[] }, siblingIndex: number, siblingCount: number): LayoutNode {
  const color = offset.colors[depth % offset.colors.length]
  const children = (node.children ?? []).map((child, i) =>
    layoutTree(child, depth + 1, offset, i, (node.children ?? []).length)
  )

  const totalWidth = Math.max(1, children.reduce((sum, c) => sum + getSubtreeWidth(c), 0))
  const x = offset.x + (children.length > 0 ? children[0].x + totalWidth / 2 : 0)
  const y = depth * 80

  return {
    id: node.id,
    label: node.label,
    x: children.length > 0 ? x : offset.x,
    y,
    color: node.color ?? color,
    children,
  }
}

function getSubtreeWidth(node: LayoutNode): number {
  if (node.children.length === 0) return 80
  return node.children.reduce((sum, c) => sum + getSubtreeWidth(c), 0)
}

function flattenWithEdges(node: LayoutNode): { nodes: LayoutNode[]; edges: { from: LayoutNode; to: LayoutNode }[] } {
  const nodes: LayoutNode[] = []
  const edges: { from: LayoutNode; to: LayoutNode }[] = []

  function walk(n: LayoutNode) {
    nodes.push(n)
    for (const child of n.children) {
      edges.push({ from: n, to: child })
      walk(child)
    }
  }

  walk(node)
  return { nodes, edges }
}

export function DiagramTree({ data, animate = true }: DiagramProps) {
  if (!data.root) {
    return <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>Tree diagram requires a root node</div>
  }

  const layout = useMemo(() => {
    const root = layoutTree(data.root!, 0, { x: 40, colors: nodeColors }, 0, 1)
    return flattenWithEdges(root)
  }, [data.root])

  const maxY = Math.max(...layout.nodes.map(n => n.y)) + 60
  const maxX = Math.max(...layout.nodes.map(n => n.x)) + 80

  return (
    <div style={{ margin: '1em 0', padding: '0.75em', backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'auto' }}>
      {data.title && <div style={{ fontWeight: 600, marginBottom: '0.5em', fontSize: 'var(--font-size-sm)' }}>{data.title}</div>}
      <svg viewBox={`0 0 ${maxX} ${maxY}`} style={{ width: '100%', maxHeight: '500px' }}>
        {layout.edges.map((e, i) => {
          const midY = (e.from.y + e.to.y) / 2
          return (
            <motion.path
              key={`edge-${i}`}
              d={`M${e.from.x},${e.from.y + 25} L${e.from.x},${midY} L${e.to.x},${midY} L${e.to.x},${e.to.y - 15}`}
              fill="none"
              stroke="var(--border)" strokeWidth="1.5"
              initial={animate ? { pathLength: 0 } : undefined}
              animate={animate ? { pathLength: 1 } : undefined}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.03 }}
            />
          )
        })}
        {layout.nodes.map((n, i) => (
          <motion.g
            key={n.id}
            initial={animate ? { opacity: 0, scale: 0.5 } : undefined}
            animate={animate ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <motion.rect
              x={n.x - 35} y={n.y - 15} width="70" height="30" rx="6"
              fill={n.color} opacity="0.85"
              whileHover={{ opacity: 1, scale: 1.05 }}
              style={{ cursor: 'pointer' }}
            />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="500" pointerEvents="none">
              {n.label}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  )
}
