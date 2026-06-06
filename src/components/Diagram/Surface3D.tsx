import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

interface Props {
  data: number[][]
  color?: string
  wireframe?: boolean
  opacity?: number
}

function createSurfaceGeometry(data: number[][]): THREE.BufferGeometry {
  const rows = data.length
  const cols = data[0]?.length ?? 0
  if (rows === 0 || cols === 0) return new THREE.BufferGeometry()

  const vertices: number[] = []
  const indices: number[] = []
  const colors: number[] = []
  const minVal = Math.min(...data.flat())
  const maxVal = Math.max(...data.flat())
  const range = maxVal - minVal || 1
  const hueStart = 0.55 // blue
  const hueEnd = 0.0 // red

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = (j / (cols - 1)) * 4 - 2
      const z = (i / (rows - 1)) * 4 - 2
      const y = ((data[i][j] - minVal) / range) * 2 - 1
      vertices.push(x, y, z)

      const t = (data[i][j] - minVal) / range
      const color = new THREE.Color().setHSL(hueStart + (hueEnd - hueStart) * t, 0.8, 0.5)
      colors.push(color.r, color.g, color.b)
    }
  }

  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < cols - 1; j++) {
      const a = i * cols + j
      const b = i * cols + j + 1
      const c = (i + 1) * cols + j
      const d = (i + 1) * cols + j + 1
      indices.push(a, b, c)
      indices.push(b, d, c)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

export function Surface3D({ data, wireframe = false, opacity = 0.9 }: Props) {
  const meshRef = useRef<THREE.Mesh>(null)

  const geometry = useMemo(() => createSurfaceGeometry(data), [data])

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry} scale={1}>
      <meshPhongMaterial
        vertexColors
        wireframe={wireframe}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        shininess={30}
      />
    </mesh>
  )
}
