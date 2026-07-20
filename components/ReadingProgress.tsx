'use client'

import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, useIsomorphicLayoutEffect } from '@/lib/gsap'

export default function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const [percent, setPercent] = useState(0)

  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: 'article',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          setPercent(Math.round(self.progress * 100))
          if (barRef.current) {
            gsap.set(barRef.current, { scaleY: self.progress })
          }
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="fixed left-0 top-0 z-50 h-screen w-[3px] pointer-events-none">
      <div className="absolute inset-0 bg-ink/5" />
      <div
        ref={barRef}
        className="absolute inset-0 origin-bottom"
        style={{
          background: 'linear-gradient(to top, #00FF88, #00E5FF, #FF2D95)',
          transform: 'scaleY(0)',
        }}
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted">
        {percent}%
      </div>
    </div>
  )
}