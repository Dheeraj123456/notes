import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { DiagramProps, FlowNode, FlowEdge } from './types'

const defaultColor = '#4ecdc4'
const nodeColors = ['#4ecdc4', '#ff6b6b', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f']

function getShapePath(shape: string, x: number, y: number, w: number, h: number): string {
  switch (shape) {
    case 'diamond':
      return `M${x},${y + h / 2} L${x + w / 2},${y} L${x + w},${y + h / 2} L${x + w / 2},${y + h} Z`
    case 'circle':
      const r = Math.min(w, h) / 2
      const cx = x + w / 2
      const cy = y + h / 2
      return `M${cx},${cy - r} A${r},${r} 0 1,1 ${cx},${cy + r} A${r},${r} 0 1,1 ${cx},${cy - r} Z`
    case 'parallelogram':
      const skew = w * 0.2
      return `M${x + skew},${y} L${x + w},${y} L${x + w - skew},${y + h} L${x},${y + h} Z`
    default:
      return `M${x},${y} L${x + w},${y} L${x + w},${y + h} L${x},${y + h} Z`
  }
}

function layoutFlow(nodes: FlowNode[], edges: FlowEdge[]): FlowNode[] {
  const laid = nodes.map(n => ({ ...n }))
  const withPos = laid.filter(n => n.x !== undefined && n.y !== undefined)
  const withoutPos = laid.filter(n => n.x === undefined || n.y === undefined)

  if (withoutPos.length === 0) return laid

  const nodeMap = new Map(laid.map(n => [n.id, n]))
  const inDeg = new Map<string, number>()
  const outDeg = new Map<string, number>()
  for (const n of laid) { inDeg.set(n.id, 0); outDeg.set(n.id, 0) }
  for (const e of edges) {
    outDeg.set(e.from, (outDeg.get(e.from) ?? 0) + 1)
    inDeg.set(e.to, (inDeg.get(e.to) ?? 0) + 1)
  }

  const roots = laid.filter(n => (inDeg.get(n.id) ?? 0) === 0)
  const maxY = withPos.length > 0 ? Math.max(...withPos.map(n => n.y ?? 0)) + 80 : 40
  const maxX = withPos.length > 0 ? Math.max(...withPos.map(n => n.x ?? 0)) + 160 : 160

  const level: string[][] = []
  const visited = new Set<string>()

  function dfs(id: string, depth: number) {
    if (visited.has(id)) return
    visited.add(id)
    while (level.length <= depth) level.push([])
    level[depth].push(id)
    const node = nodeMap.get(id)
    if (node) {
      const outgoing = edges.filter(e => e.from === id)
      for (const e of outgoing) dfs(e.to, depth + 1)
    }
  }

  for (const r of roots) dfs(r.id, 0)

  let y = maxY
  for (const row of level) {
    let x = maxX
    for (const id of row) {
      const node = nodeMap.get(id)
      if (node && (node.x === undefined || node.y === undefined)) {
        node.x = x
        node.y = y
        x += 160
      }
    }
    y += 100
  }

  return laid
}

export function DiagramFlow({ data, animate = true }: DiagramProps) {
  const { nodes = [], edges = [] } = data

  const laidOut = useMemo(() => layoutFlow(nodes, edges), [nodes, edges])
  const colorMap = useMemo(() => {
    const m = new Map<string, string>()
    laidOut.forEach((n, i) => m.set(n.id, n.color ?? nodeColors[i % nodeColors.length]))
    return m
  }, [laidOut])

  const nodeW = 120
  const nodeH = 50
  const padding = 30

  const bounds = useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const n of laidOut) {
      const x = n.x ?? 0
      const y = n.y ?? 0
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x + nodeW > maxX) maxX = x + nodeW
      if (y + nodeH > maxY) maxY = y + nodeH
    }
    return { minX: minX - padding, minY: minY - padding, maxX: maxX + padding, maxY: maxY + padding }
  }, [laidOut])

  const viewW = Math.max(300, bounds.maxX - bounds.minX)
  const viewH = Math.max(150, bounds.maxY - bounds.minY)

  return (
    <div style={{ margin: '1em 0', padding: '0.75em', backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'auto' }}>
      {data.title && <div style={{ fontWeight: 600, marginBottom: '0.5em', fontSize: 'var(--font-size-sm)' }}>{data.title}</div>}
      <svg viewBox={`${bounds.minX} ${bounds.minY} ${viewW} ${viewH}`} style={{ width: '100%', maxHeight: '500px' }}>
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="var(--text-muted)" />
          </marker>
        </defs>

        {edges.map((e, i) => {
          const from = laidOut.find(n => n.id === e.from)
          const to = laidOut.find(n => n.id === e.to)
          if (!from || !to) return null
          const fx = (from.x ?? 0) + nodeW
          const fy = (from.y ?? 0) + nodeH / 2
          const tx = (to.x ?? 0)
          const ty = (to.y ?? 0) + nodeH / 2
          const midX = (fx + tx) / 2
          const midY = (fy + ty) / 2
          const cpx = (fx + tx) / 2
          const cpy = Math.min(fy, ty) - 20
          const curved = Math.abs(fx - tx) < 30

          return (
            <g key={i}>
              <motion.line
                x1={fx} y1={fy} x2={tx} y2={ty}
                stroke="var(--text-muted)" strokeWidth="1.5"
                markerEnd="url(#arrowhead)"
                initial={animate ? { pathLength: 0 } : undefined}
                animate={animate ? { pathLength: 1 } : undefined}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
              />
              {e.label && (
                <text x={midX} y={midY - 6} textAnchor="middle" fill="var(--text-muted)" fontSize="9">
                  {e.label}
                </text>
              )}
            </g>
          )
        })}

        {laidOut.map((n, i) => {
          const x = n.x ?? 0
          const y = n.y ?? 0
          const color = colorMap.get(n.id) ?? defaultColor
          const shape = n.shape ?? 'rect'
          const pathD = getShapePath(shape, x, y, nodeW, nodeH)

          return (
            <motion.g
              key={n.id}
              initial={animate ? { opacity: 0, scale: 0.5 } : undefined}
              animate={animate ? { opacity: 1, scale: 1 } : undefined}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <motion.path
                d={pathD}
                fill={color} opacity="0.85" stroke={color} strokeWidth="1.5"
                whileHover={{ opacity: 1, scale: 1.05 }}
                style={{ originX: x + nodeW / 2, originY: y + nodeH / 2 }}
                cursor="pointer"
              />
              <text
                x={x + nodeW / 2} y={y + nodeH / 2}
                textAnchor="middle" dominantBaseline="central"
                fill="#fff" fontSize="11" fontWeight="500"
                pointerEvents="none"
              >
                {n.label}
              </text>
            </motion.g>
          )
        })}
      </svg>
    </div>
  )
}
