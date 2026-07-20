'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    document.documentElement.classList.add('has-custom-cursor')

    const dot = dotRef.current!
    const ring = ringRef.current!

    const xToDot = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' })
    const yToDot = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' })
    const xToRing = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3' })
    const yToRing = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3' })

    const onMove = (e: MouseEvent) => {
      xToDot(e.clientX)
      yToDot(e.clientY)
      xToRing(e.clientX)
      yToRing(e.clientY)

      const target = e.target as HTMLElement
      const isHoverTarget = target.closest('[data-cursor="hover"], a, button')
      if (isHoverTarget) {
        ring.classList.add('hovering')
      } else {
        ring.classList.remove('hovering')
      }
    }

    window.addEventListener('pointermove', onMove as EventListener)

    return () => {
      document.documentElement.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', onMove as EventListener)
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  )
}
