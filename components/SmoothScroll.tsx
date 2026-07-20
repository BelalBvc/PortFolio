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

    ScrollTrigger.config({ ignoreMobileResize: true })

    const lenis = new Lenis({
      lerp: 0.1,
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

    const refresh = () => {
      requestAnimationFrame(() => ScrollTrigger.refresh())
    }

    const refreshTimeout = setTimeout(refresh, 150)
    window.addEventListener('load', refresh)
    document.fonts.ready.then(refresh)

    let resizeTimer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(refresh, 300)
    }
    window.addEventListener('resize', onResize)

    return () => {
      clearTimeout(refreshTimeout)
      clearTimeout(resizeTimer)
      window.removeEventListener('load', refresh)
      window.removeEventListener('resize', onResize)
      clearLenis()
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
