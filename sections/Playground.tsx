'use client'

import { useRef } from 'react'
import { gsap, useIsomorphicLayoutEffect } from '@/lib/gsap'
import SectionHeader from '@/components/SectionHeader'
import SubwayRunnerLazy from '@/components/game/SubwayRunnerLazy'

export default function Playground() {
  const sectionRef = useRef<HTMLElement>(null)
  const gameRef = useRef<HTMLDivElement>(null)
  const asideRef = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!sectionRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.from(gameRef.current, {
        y: 60,
        opacity: 0,
        ease: 'power3.out',
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: 'top 65%',
        },
      })
      gsap.from(asideRef.current?.children ?? [], {
        y: 24,
        opacity: 0,
        stagger: 0.08,
        ease: 'power3.out',
        duration: 0.8,
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: 'top 60%',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="play"
      ref={sectionRef}
      className="relative min-h-screen w-full flex flex-col justify-center overflow-hidden py-20"
    >
      {/* ambient glow */}
      <div
        className="absolute inset-0 z-0 opacity-15 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, var(--accent) 0%, transparent 55%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 w-full">
        <SectionHeader
          index="§05"
          label="Playground"
          title="Bored? Run."
          subtitle="Scrolling a portfolio is work. Take a break — an endless runner built from scratch with Three.js, right here in the page."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
          <div ref={gameRef}>
            <SubwayRunnerLazy />
          </div>

          <div ref={asideRef} className="flex flex-col gap-6 font-mono text-xs">
            <div className="border border-line p-5">
              <div className="text-[10px] tracking-widest2 text-accent mb-3">
                // how_to_play
              </div>
              <ul className="space-y-2 text-muted leading-relaxed">
                <li><span className="text-ink">← →</span> switch lane</li>
                <li><span className="text-ink">↑ / space</span> jump barriers</li>
                <li><span className="text-ink">↓</span> roll under beams</li>
                <li><span className="text-ink">swipe</span> on touch devices</li>
              </ul>
            </div>

            <div className="border border-line p-5">
              <div className="text-[10px] tracking-widest2 text-accent mb-3">
                // under_the_hood
              </div>
              <ul className="space-y-2 text-muted leading-relaxed">
                <li>raw Three.js — no game engine</li>
                <li>instanced meshes for scenery</li>
                <li>AABB collision detection</li>
                <li>procedural spawn patterns</li>
                <li>camera shake &amp; FOV kick</li>
                <li>high score in localStorage</li>
              </ul>
            </div>

            <div className="border border-line p-5 text-muted leading-relaxed">
              <span className="text-accent">$</span> boredom --fix
              <br />
              <span className="text-ink">✓ running at 60fps</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
