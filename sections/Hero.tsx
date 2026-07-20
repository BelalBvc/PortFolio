'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useIsomorphicLayoutEffect } from '@/lib/gsap'
import Scene3DLazy from '@/components/three/Scene3DLazy'
import Marquee from '@/components/Marquee'
import Nav from '@/components/Nav'

const STACK_MARQUEE = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL',
  'Redis', 'AWS', 'Docker', 'Three.js', 'GSAP', 'WebGL', 'Terraform',
]

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const roleRef = useRef<HTMLParagraphElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!sectionRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.to(nameRef.current, {
        yPercent: -15,
        opacity: 0,
        filter: 'blur(16px)',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      })

      gsap.to(roleRef.current, {
        yPercent: -10,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden flex items-center justify-center"
    >
      <Nav />

      <div className="absolute inset-0 z-0">
        <Scene3DLazy />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-transparent to-bg/80" />
      </div>

      <div className="relative z-10 text-center px-4 w-full">
        <div className="mb-4">
          <span className="font-mono text-[10px] tracking-widest2 text-accent">§00</span>
        </div>

        <h1
          ref={nameRef}
          className="font-display italic font-bold tracking-tightest leading-[0.82] text-[clamp(3.5rem,2rem+16vw,18vw)] text-ink mb-2"
        >
          Bilal
          <br />
          Nazih
        </h1>

        <p
          ref={roleRef}
          className="font-mono text-[clamp(0.75rem,1.5vw,1rem)] tracking-widest2 uppercase text-muted"
        >
          Full Stack Developer
        </p>
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-10">
        <Marquee items={STACK_MARQUEE} speed={40} />
      </div>
    </section>
  )
}
