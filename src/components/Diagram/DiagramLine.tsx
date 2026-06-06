import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { DiagramProps } from './types'

export function DiagramLine({ data, animate = true, width = 600, height = 220 }: DiagramProps) {
  const maxVal = useMemo(() => {
    let max = 1
    for (const ds of data.datasets ?? []) {
      for (const v of ds.data) {
        if (v > max) max = v
      }
    }
    return max
  }, [data])

  const pad = { top: 20, right: 20, bottom: 30, left: 40 }
  const chartW = width - pad.left - pad.right
  const chartH = height - pad.top - pad.bottom
  const labels = data.labels ?? []
  const datasets = data.datasets ?? []

  return (
    <div style={{ margin: '1em 0', padding: '0.75em', backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'auto' }}>
      {data.title && <div style={{ fontWeight: 600, marginBottom: '0.5em', fontSize: 'var(--font-size-sm)' }}>{data.title}</div>}
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }}>
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + chartH} stroke="var(--border)" />
        <line x1={pad.left} y1={pad.top + chartH} x2={pad.left + chartW} y2={pad.top + chartH} stroke="var(--border)" />
        {[0.25, 0.5, 0.75].map(frac => (
          <line key={frac} x1={pad.left} y1={pad.top + chartH * (1 - frac)} x2={pad.left + chartW} y2={pad.top + chartH * (1 - frac)}
            stroke="var(--border-light)" strokeDasharray="4 4" />
        ))}

        {datasets.map((ds, di) => {
          const color = ds.color ?? 'var(--accent)'
          const points = ds.data.map((v, i) => ({
            x: pad.left + (i / Math.max(labels.length - 1, 1)) * chartW,
            y: pad.top + chartH - (v / maxVal) * chartH,
          }))
          const pathD = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ')

          return (
            <g key={di}>
              <motion.path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinejoin="round"
                initial={animate ? { pathLength: 0 } : undefined}
                animate={animate ? { pathLength: 1 } : undefined}
                transition={{ duration: 0.8, delay: di * 0.2 }}
              />
              {points.map((p, i) => (
                <motion.circle
                  key={i}
                  cx={p.x} cy={p.y} r="4"
                  fill={color} stroke="var(--bg-primary)" strokeWidth="2"
                  initial={animate ? { scale: 0 } : undefined}
                  animate={animate ? { scale: 1 } : undefined}
                  transition={{ delay: 0.5 + i * 0.03 }}
                  whileHover={{ scale: 1.5 }}
                />
              ))}
            </g>
          )
        })}

        {labels.map((label, i) => {
          const x = pad.left + (i / Math.max(labels.length - 1, 1)) * chartW
          return (
            <text key={i} x={x} y={height - 5} textAnchor="middle" fill="var(--text-muted)" fontSize="9">
              {label}
            </text>
          )
        })}

        {datasets.length > 1 && (
          <g>
            {datasets.map((ds, i) => (
              <text key={i} x={pad.left + chartW - 60} y={pad.top + 14 + i * 14} fill={ds.color ?? 'var(--accent)'} fontSize="9">
                ● {ds.label}
              </text>
            ))}
          </g>
        )}
      </svg>
    </div>
  )
}
