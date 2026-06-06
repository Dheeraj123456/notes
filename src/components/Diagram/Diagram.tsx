import type { DiagramProps } from './types'
import { DiagramFlow } from './DiagramFlow'
import { DiagramTree } from './DiagramTree'
import { DiagramNetwork } from './DiagramNetwork'
import { DiagramVenn } from './DiagramVenn'
import { DiagramBar } from './DiagramBar'
import { DiagramLine } from './DiagramLine'

export type { DiagramProps, DiagramData, FlowNode, FlowEdge, TreeNode, NetworkNode, NetworkEdge, VennSet, ChartDataset } from './types'

export function Diagram(props: DiagramProps) {
  switch (props.type) {
    case 'flow':
      return <DiagramFlow {...props} />
    case 'tree':
      return <DiagramTree {...props} />
    case 'network':
      return <DiagramNetwork {...props} />
    case 'venn':
      return <DiagramVenn {...props} />
    case 'bar':
      return <DiagramBar {...props} />
    case 'line':
      return <DiagramLine {...props} />
    default:
      return <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>Unknown diagram type: {props.type}</div>
  }
}
