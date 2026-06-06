import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { DiagramProps } from './types'

export function DiagramBar({ data, animate = true, width = 600, height = 220 }: DiagramProps) {
  const chartData = useMemo(() => {
    if (!data.labels || !data.datasets) return []
    return data.labels.map((label, i) => ({
      name: label,
      values: data.datasets!.map(d => ({
        label: d.label,
        value: d.data[i] ?? 0,
        color: d.color,
      })),
    }))
  }, [data])

  const maxVal = useMemo(() => {
    let max = 1
    for (const item of chartData) {
      for (const v of item.values) {
        if (v.value > max) max = v.value
      }
    }
    return max
  }, [chartData])

  const pad = { top: 20, right: 20, bottom: 30, left: 40 }
  const chartW = width - pad.left - pad.right
  const chartH = height - pad.top - pad.bottom
  const numGroups = chartData.length
  const numBars = data.datasets?.length ?? 1
  const groupWidth = numGroups > 0 ? Math.min(chartW / numGroups - 4, 60) : 20
  const barWidth = Math.max(4, (groupWidth - 4) / numBars)

  return (
    <div style={{ margin: '1em 0', padding: '0.75em', backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'auto' }}>
      {data.title && <div style={{ fontWeight: 600, marginBottom: '0.5em', fontSize: 'var(--font-size-sm)' }}>{data.title}</div>}
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }}>
        <line x1={pad.left} y1={pad.top + chartH} x2={pad.left + chartW} y2={pad.top + chartH} stroke="var(--border)" />
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + chartH} stroke="var(--border)" />
        {chartData.map((item, gi) =>
          item.values.map((v, bi) => {
            const x = pad.left + gi * (groupWidth + 4) + bi * barWidth
            const barH = (v.value / maxVal) * chartH
            const y = pad.top + chartH - barH
            const color = v.color ?? 'var(--accent)'
            return (
              <motion.g
                key={`${gi}-${bi}`}
                initial={animate ? { scaleY: 0, y: pad.top + chartH } : undefined}
                animate={animate ? { scaleY: 1, y: 0 } : undefined}
                transition={{ duration: 0.4, delay: gi * 0.05 }}
                style={{ originX: x + barWidth / 2, originY: pad.top + chartH }}
              >
                <motion.rect
                  x={x} y={y} width={barWidth} height={barH} rx="3"
                  fill={color} opacity="0.85"
                  whileHover={{ opacity: 1, scaleY: 1.05, scaleX: 1.05 }}
                  style={{ originX: x + barWidth / 2, originY: pad.top + chartH }}
                />
                <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="500">
                  {v.value}
                </text>
              </motion.g>
            )
          })
        )}
        {chartData.map((item, i) => (
          <text key={i} x={pad.left + i * (groupWidth + 4) + groupWidth / 2} y={height - 5} textAnchor="middle" fill="var(--text-muted)" fontSize="9">
            {item.name}
          </text>
        ))}
      </svg>
    </div>
  )
}
