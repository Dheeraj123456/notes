import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { DiagramProps } from './types'

const defColors = ['#4ecdc4', '#ff6b6b', '#45b7d1', '#fdcb6e', '#6c5ce7']

interface Circle {
  cx: number
  cy: number
  r: number
  label: string
  color: string
}

export function DiagramVenn({ data, animate = true }: DiagramProps) {
  const sets = data.sets ?? []
  if (sets.length === 0) {
    return <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>Venn diagram requires at least one set</div>
  }

  const circles = useMemo((): Circle[] => {
    const count = Math.min(sets.length, 3)
    const r = 80
    const spacing = 50
    const positions = [
      // 1 set
      [{ cx: 120, cy: 100, r }],
      // 2 sets
      [
        { cx: 100 - spacing, cy: 100, r },
        { cx: 100 + spacing, cy: 100, r },
      ],
      // 3 sets (triangular)
      [
        { cx: 100 - spacing, cy: 100 - spacing * 0.6, r },
        { cx: 100 + spacing, cy: 100 - spacing * 0.6, r },
        { cx: 100, cy: 100 + spacing * 0.7, r },
      ],
    ]

    const pos = positions[count - 1] ?? positions[0]
    return pos.map((p, i) => ({
      ...p,
      label: sets[i]?.label ?? `Set ${i + 1}`,
      color: sets[i]?.color ?? defColors[i % defColors.length],
    }))
  }, [sets])

  return (
    <div style={{ margin: '1em 0', padding: '0.75em', backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'auto' }}>
      {data.title && <div style={{ fontWeight: 600, marginBottom: '0.5em', fontSize: 'var(--font-size-sm)' }}>{data.title}</div>}
      <svg viewBox="0 0 240 220" style={{ width: '100%', maxHeight: '300px' }}>
        {circles.map((c, i) => (
          <motion.g key={i}>
            <motion.circle
              cx={c.cx} cy={c.cy} r={c.r}
              fill={c.color} opacity="0.3"
              stroke={c.color} strokeWidth="2"
              initial={animate ? { scale: 0 } : undefined}
              animate={animate ? { scale: 1 } : undefined}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              style={{ originX: c.cx, originY: c.cy }}
            />
            <text x={c.cx} y={c.cy + c.r + 16} textAnchor="middle" fill={c.color} fontSize="11" fontWeight="500">
              {c.label}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  )
}
