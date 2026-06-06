import { useMemo, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import * as d3Force from 'd3-force'

interface Node3D {
  id: string
  label?: string
  color?: string
}

interface Edge3D {
  source: string
  target: string
  weight?: number
}

interface Props {
  nodes: Node3D[]
  edges: Edge3D[]
}

const nodeColors = ['#4ecdc4', '#ff6b6b', '#45b7d1', '#fdcb6e', '#6c5ce7', '#fd79a8']

interface SimNode {
  id: string
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
}

export function Network3D({ nodes: rawNodes, edges: rawEdges }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const [simNodes, setSimNodes] = useState<(SimNode & { color: string })[]>([])

  useEffect(() => {
    const nodes: SimNode[] = rawNodes.map(n => ({
      id: n.id,
      x: (Math.random() - 0.5) * 4,
      y: (Math.random() - 0.5) * 4,
      z: (Math.random() - 0.5) * 4,
      vx: 0,
      vy: 0,
      vz: 0,
    }))

    const links = rawEdges.map(e => ({
      source: e.source,
      target: e.target,
    }))

    const simulation = d3Force.forceSimulation(nodes)
      .force('link', d3Force.forceLink<SimNode>(links as any).id(d => d.id).distance(1.5))
      .force('charge', d3Force.forceManyBody().strength(-30))
      .force('center', d3Force.forceCenter(0, 0))
      .alphaDecay(0.02)

    simulation.on('tick', () => {
      setSimNodes(nodes.map(n => ({
        ...n,
        color: rawNodes[rawNodes.findIndex(rn => rn.id === n.id)]?.color ?? nodeColors[Math.floor(Math.random() * nodeColors.length)],
      })))
    })

    setTimeout(() => simulation.stop(), 3000)

    return () => simulation.stop()
  }, [rawNodes, rawEdges])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08
    }
  })

  const positionMap = useMemo(() => {
    const m = new Map<string, { x: number; y: number; z: number }>()
    simNodes.forEach(n => m.set(n.id, { x: n.x, y: n.y, z: n.z }))
    return m
  }, [simNodes])

  return (
    <group ref={groupRef}>
      {rawEdges.map((e, i) => {
        const source = positionMap.get(e.source)
        const target = positionMap.get(e.target)
        if (!source || !target) return null

        const points = [
          new THREE.Vector3(source.x, source.y, source.z),
          new THREE.Vector3(target.x, target.y, target.z),
        ]
        const geometry = new THREE.BufferGeometry().setFromPoints(points)

        return (
          <line key={`edge-${i}`} geometry={geometry}>
            <lineBasicMaterial color="#666" transparent opacity={0.4} />
          </line>
        )
      })}

      {simNodes.map((n, i) => (
        <mesh key={n.id} position={[n.x, n.y, n.z]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={n.color} roughness={0.3} metalness={0.2} />
        </mesh>
      ))}
    </group>
  )
}
