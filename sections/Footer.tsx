'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap, useIsomorphicLayoutEffect } from '@/lib/gsap'
import Link from 'next/link'

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [easterEgg, setEasterEgg] = useState(false)

  useIsomorphicLayoutEffect(() => {
    if (!sectionRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.from(ctaRef.current, {
        yPercent: 30,
        opacity: 0,
        ease: 'power3.out',
        duration: 1.2,
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: 'top 70%',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

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
      id="contact"
      ref={sectionRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          background:
            'radial-gradient(circle at 50% 80%, var(--accent) 0%, transparent 60%)',
        }}
      />

      <div ref={ctaRef} className="relative z-10 text-center px-4">
        <div className="flex items-baseline justify-center gap-3 mb-8">
          <span className="font-mono text-[10px] tracking-widest2 text-accent">§06</span>
          <span className="font-mono text-[10px] tracking-widest2 uppercase text-muted">
            / Contact
          </span>
        </div>

        <button
          onClick={() => (window.location.href = 'mailto:hello@bilalnazih.dev')}
          data-cursor="hover"
          className="group text-ink transition-colors duration-500 hover:text-accent"
        >
          <h2 className="font-display italic font-bold tracking-tightest text-[clamp(2.5rem,8vw,9rem)] leading-none">
            Let&apos;s
            <br />
            Talk
          </h2>
        </button>

        <div className="mt-14 flex flex-col items-center gap-5">
          <a
            href="mailto:hello@bilalnazih.dev"
            data-cursor="hover"
            className="font-mono text-sm text-muted hover:text-accent transition-colors"
          >
            hello@bilalnazih.dev
          </a>
          <div className="flex gap-8 font-mono text-[11px] text-muted">
            <a
              href="https://github.com/bilalnazih"
              data-cursor="hover"
              className="hover:text-accent transition-colors"
              target="_blank"
              rel="noopener"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/bilalnazih"
              data-cursor="hover"
              className="hover:text-accent transition-colors"
              target="_blank"
              rel="noopener"
            >
              LinkedIn
            </a>
            <a
              href="https://twitter.com/bilalnazih"
              data-cursor="hover"
              className="hover:text-accent transition-colors"
              target="_blank"
              rel="noopener"
            >
              Twitter
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 z-10 font-mono text-[9px] text-muted/30 select-none">
        <pre>{`/*
 * see you in production
 * — bilal
 *
 * p.s. try the konami code ↑↑↓↓←→←→ba
 */`}</pre>
      </div>

      <div className="absolute bottom-8 right-8 z-10">
        <Link href="/blog" data-cursor="hover" className="font-display italic font-bold text-lg text-muted/40 hover:text-accent transition-colors">
          BN
        </Link>
      </div>

      {easterEgg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="glass rounded-2xl px-12 py-8 text-center">
            <p className="font-display italic font-bold text-4xl text-accent">
              You found me
            </p>
            <p className="font-mono text-xs text-muted mt-4">
              // you clearly pay attention to detail. we should talk.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
