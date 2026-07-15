'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap, ScrollTrigger, useIsomorphicLayoutEffect } from '@/lib/gsap'
import MagneticButton from '@/components/MagneticButton'

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [easterEgg, setEasterEgg] = useState(false)

  // Reveal animation
  useIsomorphicLayoutEffect(() => {
    if (!sectionRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.from(ctaRef.current, {
        yPercent: 40,
        opacity: 0,
        ease: 'power3.out',
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: 'top 70%',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Konami code easter egg
  useEffect(() => {
    let buffer: string[] = []

    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      buffer.push(key)
      buffer = buffer.slice(-KONAMI.length)

      if (buffer.join(',') === KONAMI.join(',')) {
        setEasterEgg(true)
        setTimeout(() => setEasterEgg(false), 5000)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Glow background */}
      <div
        className="absolute inset-0 z-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 50% 80%, var(--neon) 0%, transparent 60%)',
        }}
      />

      <div ref={ctaRef} className="relative z-10 text-center px-4">
        <p className="font-mono text-xs tracking-widest2 uppercase text-muted mb-8">
          // let&apos;s build something
        </p>

        <MagneticButton
          strength={0.5}
          className="group"
          onClick={() => (window.location.href = 'mailto:hello@bilalnazih.dev')}
        >
          <span className="font-display font-bold tracking-tightest text-[clamp(3rem,10vw,12rem)] leading-none gradient-text">
            LET&apos;S TALK
          </span>
        </MagneticButton>

        <div className="mt-12 flex flex-col items-center gap-4">
          <a
            href="mailto:hello@bilalnazih.dev"
            data-cursor="hover"
            className="font-mono text-sm text-text/70 hover:text-neon transition-colors"
          >
            hello@bilalnazih.dev
          </a>
          <div className="flex gap-6 font-mono text-xs text-muted">
            <a
              href="https://github.com/bilalnazih"
              data-cursor="hover"
              className="hover:text-neon transition-colors"
              target="_blank"
              rel="noopener"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/bilalnazih"
              data-cursor="hover"
              className="hover:text-neon transition-colors"
              target="_blank"
              rel="noopener"
            >
              LinkedIn
            </a>
            <a
              href="https://twitter.com/bilalnazih"
              data-cursor="hover"
              className="hover:text-neon transition-colors"
              target="_blank"
              rel="noopener"
            >
              Twitter
            </a>
          </div>
        </div>
      </div>

      {/* Hidden code greeting */}
      <div className="absolute bottom-8 left-8 z-10 font-mono text-[10px] text-muted/40 select-none">
        <pre>{`/*
 * see you in production
 * — bilal
 *
 * p.s. try the konami code ↑↑↓↓←→←→ba
 */`}</pre>
      </div>

      {/* Easter egg overlay */}
      {easterEgg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="glass rounded-2xl px-12 py-8 text-center animate-pulse">
            <p className="font-display font-bold text-section gradient-text">
              🎉 YOU FOUND ME
            </p>
            <p className="font-mono text-sm text-muted mt-4">
              // you clearly pay attention to detail. we should talk.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}