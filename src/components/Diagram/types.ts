export interface FlowNode {
  id: string
  label: string
  x?: number
  y?: number
  shape?: 'rect' | 'diamond' | 'circle' | 'parallelogram'
  color?: string
}

export interface FlowEdge {
  from: string
  to: string
  label?: string
}

export interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
  color?: string
}

export interface NetworkNode {
  id: string
  label?: string
  group?: string
  x?: number
  y?: number
}

export interface NetworkEdge {
  source: string
  target: string
  weight?: number
  label?: string
}

export interface VennSet {
  id: string
  label: string
  size: number
}

export interface VennOverlap {
  sets: string[]
  size: number
}

export interface ChartDataset {
  label: string
  data: number[]
  color?: string
}

export interface DiagramData {
  title?: string
  nodes?: FlowNode[]
  edges?: FlowEdge[]
  root?: TreeNode
  networkNodes?: NetworkNode[]
  networkEdges?: NetworkEdge[]
  sets?: VennSet[]
  overlaps?: VennOverlap[]
  labels?: string[]
  datasets?: ChartDataset[]
}

export interface DiagramProps {
  type: 'flow' | 'tree' | 'network' | 'venn' | 'bar' | 'line'
  data: DiagramData
  width?: number
  height?: number
  animate?: boolean
  dark?: boolean
}
