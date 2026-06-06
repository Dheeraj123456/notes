import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import * as d3Force from 'd3-force'
import type { DiagramProps, NetworkNode, NetworkEdge } from './types'

const nodeColors = ['#4ecdc4', '#ff6b6b', '#45b7d1', '#96ceb4', '#fdcb6e', '#6c5ce7', '#fd79a8', '#00cec9']

interface SimNode extends NetworkNode {
  x: number
  y: number
  vx: number
  vy: number
  fx?: number
  fy?: number
}

export function DiagramNetwork({ data, animate = true, width = 600, height = 400 }: DiagramProps) {
  const { networkNodes: rawNodes = [], networkEdges: rawEdges = [] } = data
  const svgRef = useRef<SVGSVGElement>(null)
  const [simNodes, setSimNodes] = useState<(SimNode & { color: string })[]>([])
  const [simEdges, setSimEdges] = useState<NetworkEdge[]>(rawEdges)

  useEffect(() => {
    setSimEdges(rawEdges)
  }, [rawEdges])

  useEffect(() => {
    if (rawNodes.length === 0) return

    const nodes: SimNode[] = rawNodes.map((n, i) => ({
      ...n,
      x: width / 2 + (Math.random() - 0.5) * 200,
      y: height / 2 + (Math.random() - 0.5) * 200,
      vx: 0,
      vy: 0,
    }))

    const links = rawEdges.map(e => ({
      source: e.source,
      target: e.target,
    }))

    const simulation = d3Force.forceSimulation(nodes)
      .force('link', d3Force.forceLink<SimNode>(links).id(d => d.id).distance(80))
      .force('charge', d3Force.forceManyBody().strength(-200))
      .force('center', d3Force.forceCenter(width / 2, height / 2))
      .force('collision', d3Force.forceCollide(30))
      .alphaDecay(0.02)

    simulation.on('tick', () => {
      setSimNodes(nodes.map(n => ({
        ...n,
        color: nodeColors[(rawNodes.findIndex(rn => rn.id === n.id) % nodeColors.length)],
      })))
    })

    setTimeout(() => simulation.stop(), 3000)

    return () => { simulation.stop() }
  }, [rawNodes, rawEdges, width, height])

  const pad = 40
  const minX = Math.min(...simNodes.map(n => n.x)) - pad
  const minY = Math.min(...simNodes.map(n => n.y)) - pad
  const maxX = Math.max(...simNodes.map(n => n.x)) + pad
  const maxY = Math.max(...simNodes.map(n => n.y)) + pad
  const vw = Math.max(300, maxX - minX)
  const vh = Math.max(200, maxY - minY)

  return (
    <div style={{ margin: '1em 0', padding: '0.75em', backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'auto' }}>
      {data.title && <div style={{ fontWeight: 600, marginBottom: '0.5em', fontSize: 'var(--font-size-sm)' }}>{data.title}</div>}
      <svg ref={svgRef} viewBox={`${minX} ${minY} ${vw} ${vh}`} style={{ width: '100%', height: `${Math.min(height, 500)}px` }}>
        {simEdges.map((e, i) => {
          const source = simNodes.find(n => n.id === e.source)
          const target = simNodes.find(n => n.id === e.target)
          if (!source || !target) return null
          return (
            <motion.line
              key={`edge-${i}`}
              x1={source.x} y1={source.y} x2={target.x} y2={target.y}
              stroke="var(--border)" strokeWidth={(e.weight ?? 1) * 1.5}
              initial={animate ? { opacity: 0 } : undefined}
              animate={animate ? { opacity: 1 } : undefined}
              transition={{ duration: 0.5 }}
            />
          )
        })}
        {simNodes.map((n, i) => (
          <motion.g
            key={n.id}
            initial={animate ? { opacity: 0, scale: 0 } : undefined}
            animate={animate ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.3, delay: i * 0.03 }}
          >
            <motion.circle
              cx={n.x} cy={n.y} r="20"
              fill={n.color} opacity="0.85"
              whileHover={{ scale: 1.2 }}
              style={{ cursor: 'pointer' }}
            />
            <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="10" fontWeight="500" pointerEvents="none">
              {n.label ?? n.id}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  )
}
