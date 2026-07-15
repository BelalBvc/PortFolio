'use client'

import { useRef } from 'react'
import SplitType from 'split-type'
import { gsap, ScrollTrigger, useIsomorphicLayoutEffect } from '@/lib/gsap'
import TextReveal from '@/components/TextReveal'

const BIO = `I'm Bilal — a Full Stack Engineer who treats the browser as a canvas and the server as a stage. I build performant systems end-to-end: from shader-optimized frontends to distributed backends that scale. I believe great software lives where engineering rigor meets design intent.`

export default function TheDev() {
  const sectionRef = useRef<HTMLElement>(null)
  const bioRef = useRef<HTMLParagraphElement>(null)
  const codeLineRef = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!sectionRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      // Pin the section for a tight scroll-driven transition
      ScrollTrigger.create({
        trigger: sectionRef.current!,
        start: 'top top',
        end: '+=100vh',
        pin: true,
        pinSpacing: true,
      })

      // Bio word-by-word reveal
      if (bioRef.current) {
        const split = new SplitType(bioRef.current, { types: 'words' })
        gsap.from(split.words, {
          opacity: 0.1,
          filter: 'blur(8px)',
          stagger: 0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current!,
            start: 'top top',
            end: '+=80vh',
            scrub: 1.5,
          },
        })
      }

      // Code line slides in from bottom
      gsap.from(codeLineRef.current, {
        yPercent: 100,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: 'top top',
          end: '+=60vh',
          scrub: 1.5,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
    >
      <div className="relative z-10 max-w-4xl px-6 text-center">
        <p className="font-mono text-xs tracking-widest2 uppercase text-neon mb-8">
          // the dev
        </p>

        <TextReveal
          as="h2"
          className="font-display font-bold tracking-tightest text-section leading-[0.9] mb-12"
          start="top 60%"
          end="top 20%"
        >
          ABOUT
        </TextReveal>

        <p
          ref={bioRef}
          className="font-display text-sub leading-relaxed text-text/90 max-w-2xl mx-auto"
        >
          {BIO}
        </p>

        <div
          ref={codeLineRef}
          className="mt-16 font-mono text-sm text-muted"
        >
          <span className="text-neon-2">const</span> mindset ={' '}
          <span className="text-neon-3">'engineer + artist'</span>;{' '}
          <span className="text-muted">// hi, i&apos;m bilal</span>
        </div>
      </div>
    </section>
  )
}