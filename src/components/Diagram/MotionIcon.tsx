import { motion } from 'framer-motion'

interface Props {
  type: 'spinner' | 'check' | 'pulse' | 'bounce'
  size?: number
  color?: string
}

const icons: Record<string, (size: number, color: string) => React.ReactNode> = {
  spinner(size, color) {
    return (
      <motion.svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      >
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" opacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </motion.svg>
    )
  },
  check(size, color) {
    return (
      <motion.svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.path
          d="M5 13l4 4L19 7"
          stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      </motion.svg>
    )
  },
  pulse(size, color) {
    return (
      <motion.svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <circle cx="12" cy="12" r="8" fill={color} opacity="0.3" />
        <circle cx="12" cy="12" r="4" fill={color} />
      </motion.svg>
    )
  },
  bounce(size, color) {
    return (
      <motion.svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 0.6 }}
      >
        <path d="M12 4v12M8 12l4 4 4-4" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </motion.svg>
    )
  },
}

export function MotionIcon({ type, size = 24, color = 'var(--accent)' }: Props) {
  const icon = icons[type]
  if (!icon) return null
  return <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>{icon(size, color)}</span>
}
