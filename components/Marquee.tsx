'use client'

import { useRef } from 'react'
import { gsap, useIsomorphicLayoutEffect } from '@/lib/gsap'

interface MarqueeProps {
  items: string[]
  speed?: number
  className?: string
}

export default function Marquee({ items, speed = 30, className = '' }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!trackRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const track = trackRef.current
    const width = track.scrollWidth / 2

    const tl = gsap.to(track, {
      x: -width,
      duration: speed,
      repeat: -1,
      ease: 'none',
      modifiers: {
        x: gsap.utils.unitize((val) => parseFloat(val) % width),
      },
    })

    return () => { tl.kill() }
  }, [speed])

  const doubled = [...items, ...items]

  return (
    <div className={`overflow-hidden ${className}`}>
      <div ref={trackRef} className="flex gap-6 md:gap-10 whitespace-nowrap w-max">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="font-mono text-xs md:text-sm tracking-widest text-muted/60 py-2"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
