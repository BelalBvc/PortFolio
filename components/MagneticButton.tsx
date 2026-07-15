'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useRef } from 'react'

interface MagneticButtonProps {
  children: React.ReactNode
  strength?: number
  className?: string
  onClick?: () => void
}

export default function MagneticButton({
  children,
  strength = 0.4,
  className = '',
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 150, damping: 15, mass: 0.1 })
  const y = useSpring(my, { stiffness: 150, damping: 15, mass: 0.1 })

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    mx.set(relX * strength)
    my.set(relY * strength)
  }

  const handleLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={{ x, y }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      className={`magnetic ${className}`}
      data-cursor="hover"
    >
      {children}
    </motion.button>
  )
}