import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

interface Point {
  x: number
  y: number
  z: number
  color?: string
  size?: number
}

interface Props {
  points: Point[]
  pointSize?: number
}

const defaultColors = ['#4ecdc4', '#ff6b6b', '#45b7d1', '#fdcb6e', '#6c5ce7', '#fd79a8']

export function Scatter3D({ points, pointSize = 0.08 }: Props) {
  const groupRef = useRef<THREE.Group>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(points.length * 3)
    const colors = new Float32Array(points.length * 3)

    points.forEach((p, i) => {
      positions[i * 3] = p.x
      positions[i * 3 + 1] = p.y
      positions[i * 3 + 2] = p.z

      const color = p.color ?? defaultColors[i % defaultColors.length]
      const c = new THREE.Color(color)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    })

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return geo
  }, [points])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {points.map((p, i) => {
        const color = p.color ?? defaultColors[i % defaultColors.length]
        const size = p.size ?? pointSize
        return (
          <mesh key={i} position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[size, 16, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
          </mesh>
        )
      })}
    </group>
  )
}
