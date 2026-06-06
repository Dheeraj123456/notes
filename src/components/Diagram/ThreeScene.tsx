import { Suspense, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

const Surface3D = lazy(() => import('./Surface3D').then(m => ({ default: m.Surface3D })))
const Scatter3D = lazy(() => import('./Scatter3D').then(m => ({ default: m.Scatter3D })))
const Network3D = lazy(() => import('./Network3D').then(m => ({ default: m.Network3D })))

export interface ThreeSceneProps {
  type: 'surface' | 'scatter3d' | 'network3d'
  data?: Record<string, unknown>
  width?: number
  height?: number
}

function SceneContent({ type, data }: { type: string; data?: Record<string, unknown> }) {
  switch (type) {
    case 'surface': {
      const matrix = (data?.data as number[][]) ?? [[0]]
      return <Surface3D data={matrix} />
    }
    case 'scatter3d': {
      const points = (data?.points as { x: number; y: number; z: number }[]) ?? []
      return <Scatter3D points={points} />
    }
    case 'network3d': {
      const nodes = (data?.nodes as { id: string; label?: string }[]) ?? []
      const edges = (data?.edges as { source: string; target: string }[]) ?? []
      return <Network3D nodes={nodes} edges={edges} />
    }
    default:
      return null
  }
}

export function ThreeScene({ type, data, width = 600, height = 400 }: ThreeSceneProps) {
  return (
    <div style={{
      margin: '1em 0', padding: '0.5em',
      backgroundColor: 'var(--bg-code)', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
      width: '100%', maxWidth: `${width}px`, height: `${height}px`,
    }}>
      <Canvas
        camera={{ position: [4, 3, 4], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-3, 2, -3]} intensity={0.3} />
        <Suspense fallback={null}>
          <SceneContent type={type} data={data} />
        </Suspense>
        <OrbitControls enableDamping dampingFactor={0.1} autoRotate={false} />
        <gridHelper args={[6, 6, '#444', '#333']} />
      </Canvas>
    </div>
  )
}
