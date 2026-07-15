'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useIsomorphicLayoutEffect } from '@/lib/gsap'
import Scene3DLazy from '@/components/three/Scene3DLazy'

const CODE_SNIPPET = `const bilal = {
  role: 'Full Stack Developer',
  stack: ['React', 'Node', 'AWS'],
  passion: 'clean code + clean UI',
  ship: () => '🚀 to production',
}

// the cursor reveals what's
// underneath the surface.
// move your mouse →`

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const codeRef = useRef<HTMLDivElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!sectionRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      // Title split + clip-path dissolve on scroll
      gsap.to(titleRef.current, {
        yPercent: -30,
        opacity: 0,
        filter: 'blur(20px)',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      })

      // Code layer parallax (slower)
      gsap.to(codeRef.current, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      })

      // Mask reveal follows mouse
      const section = sectionRef.current!
      const onMove = (e: MouseEvent) => {
        const rect = section.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        if (maskRef.current) {
          maskRef.current.style.setProperty('--mx', `${x}px`)
          maskRef.current.style.setProperty('--my', `${y}px`)
        }
      }
      section.addEventListener('mousemove', onMove)
      return () => section.removeEventListener('mousemove', onMove)
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden flex items-center justify-center"
    >
      {/* 3D background */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Scene3DLazy />
      </div>

      {/* Hidden code layer revealed by cursor mask */}
      <div
        ref={codeRef}
        className="code-layer absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none"
      >
        <pre className="text-center opacity-30">{CODE_SNIPPET}</pre>
      </div>

      {/* Cursor mask layer — reveals code underneath */}
      <div
        ref={maskRef}
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle 180px at var(--mx, 50%) var(--my, 50%), transparent 0%, var(--bg) 100%)',
        }}
      />

      {/* Main UI layer */}
      <div className="relative z-30 text-center px-4">
        <p className="font-mono text-xs tracking-widest2 uppercase text-muted mb-4">
          // scroll to explore
        </p>
        <h1
          ref={titleRef}
          className="font-display font-bold tracking-tightest leading-[0.85] text-[clamp(4rem,2rem+16vw,18vw)]"
        >
          <span className="block">FULL STACK</span>
          <span className="block gradient-text">DEVELOPER</span>
        </h1>
        <p className="font-mono text-sm text-muted mt-6 max-w-md mx-auto">
          Bilal Nazih — engineer who designs, designer who ships.
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 font-mono text-xs text-muted animate-pulse">
        ↓ scroll
      </div>
    </section>
  )
}