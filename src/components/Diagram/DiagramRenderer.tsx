import { useRef, useEffect, useState } from 'react'
import { Diagram } from './Diagram'
import type { DiagramData } from './types'

export function DiagramRenderer() {
  const ref = useRef<HTMLDivElement>(null)
  const [diagrams, setDiagrams] = useState<{ key: number; type: string; data: DiagramData }[]>([])

  useEffect(() => {
    const container = ref.current?.parentElement
    if (!container) return

    const blocks = container.querySelectorAll<HTMLDivElement>('.diagram-block')
    const parsed: { key: number; type: string; data: DiagramData }[] = []

    blocks.forEach((block, i) => {
      const json = block.getAttribute('data-diagram')
      if (!json) return
      try {
        const { type, data } = JSON.parse(json)
        if (['flow', 'tree', 'network', 'venn', 'bar', 'line'].includes(type)) {
          parsed.push({ key: i, type, data })
        }
      } catch {
        // ignore invalid JSON
      }
    })

    if (parsed.length > 0) {
      setDiagrams(parsed)
      blocks.forEach(b => b.remove())
    }
  }, [])

  return (
    <div ref={ref} style={{ display: 'contents' }}>
      {diagrams.map(d => (
        <Diagram key={d.key} type={d.type as any} data={d.data} />
      ))}
    </div>
  )
}
