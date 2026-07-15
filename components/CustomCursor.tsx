'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const dot = dotRef.current!
    const ring = ringRef.current!
    const xToDot = gsap.quickTo(dot, 'x', { duration: 0.15, ease: 'power3' })
    const yToDot = gsap.quickTo(dot, 'y', { duration: 0.15, ease: 'power3' })
    const xToRing = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power3' })
    const yToRing = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power3' })

    const onMove = (e: MouseEvent) => {
      xToDot(e.clientX)
      yToDot(e.clientY)
      xToRing(e.clientX)
      yToRing(e.clientY)
    }

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-cursor="hover"], a, button')) {
        ring.classList.add('hovering')
      }
    }
    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-cursor="hover"], a, button')) {
        ring.classList.remove('hovering')
      }
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  )
}