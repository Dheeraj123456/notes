import { useMemo } from 'react'

interface DataPoint {
  name: string
  value: number
  color?: string
}

interface GraphViewProps {
  title?: string
  type?: 'bar' | 'line'
  data: DataPoint[]
}

export function GraphView({ title, type = 'bar', data }: GraphViewProps) {
  const maxVal = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data])
  const barWidth = type === 'bar' ? Math.max(20, Math.min(60, 600 / data.length - 8)) : 0

  if (type === 'line') {
    const w = 600
    const h = 200
    const pad = { top: 20, right: 20, bottom: 30, left: 40 }
    const chartW = w - pad.left - pad.right
    const chartH = h - pad.top - pad.bottom

    const points = data.map((d, i) => ({
      x: pad.left + (i / Math.max(data.length - 1, 1)) * chartW,
      y: pad.top + chartH - (d.value / maxVal) * chartH,
      ...d,
    }))

    const pathD = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ')

    return (
      <div
        style={{
          margin: '1em 0',
          padding: '0.75em',
          backgroundColor: 'var(--bg-code)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          overflow: 'auto',
        }}
      >
        {title && (
          <div style={{ fontWeight: 600, marginBottom: '0.5em', fontSize: 'var(--font-size-sm)' }}>
            {title}
          </div>
        )}
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', maxWidth: `${w}px`, height: 'auto' }}>
          <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + chartH} stroke="var(--border)" />
          <line x1={pad.left} y1={pad.top + chartH} x2={pad.left + chartW} y2={pad.top + chartH} stroke="var(--border)" />

          {[0.25, 0.5, 0.75].map((frac) => (
            <line
              key={frac}
              x1={pad.left}
              y1={pad.top + chartH * (1 - frac)}
              x2={pad.left + chartW}
              y2={pad.top + chartH * (1 - frac)}
              stroke="var(--border-light)"
              strokeDasharray="4 4"
            />
          ))}

          <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />

          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--accent)" stroke="var(--bg-primary)" strokeWidth="2" />
          ))}

          {data.map((d, i) => {
            const x = pad.left + (i / Math.max(data.length - 1, 1)) * chartW
            return (
              <text key={i} x={x} y={h - 5} textAnchor="middle" fill="var(--text-muted)" fontSize="10">
                {d.name}
              </text>
            )
          })}
        </svg>
      </div>
    )
  }

  return (
    <div
      style={{
        margin: '1em 0',
        padding: '0.75em',
        backgroundColor: 'var(--bg-code)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        overflow: 'auto',
      }}
    >
      {title && (
        <div style={{ fontWeight: 600, marginBottom: '0.5em', fontSize: 'var(--font-size-sm)' }}>
          {title}
        </div>
      )}
      <svg viewBox="0 0 600 220" style={{ width: '100%', maxWidth: '600px', height: 'auto' }}>
        <line x1="40" y1="200" x2="580" y2="200" stroke="var(--border)" />
        <line x1="40" y1="20" x2="40" y2="200" stroke="var(--border)" />

        {data.map((d, i) => {
          const x = 50 + i * (barWidth + 8)
          const barH = (d.value / maxVal) * 160
          const y = 200 - barH
          const color = d.color ?? 'var(--accent)'

          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={barH} rx="3" fill={color} opacity="0.85" />
              <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="500">
                {d.value}
              </text>
              <text x={x + barWidth / 2} y="216" textAnchor="middle" fill="var(--text-muted)" fontSize="10">
                {d.name}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
