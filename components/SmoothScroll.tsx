'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { setLenis, clearLenis } from '@/lib/lenis-instance'

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1,
      autoRaf: false,
    })

    lenis.on('scroll', ScrollTrigger.update)

    setLenis(lenis)

    const raf = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // Force ScrollTrigger to recalculate after layout settles
    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 100)

    return () => {
      clearTimeout(refreshTimer)
      clearLenis()
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}