'use client'

import { useRef } from 'react'
import SplitType from 'split-type'
import { gsap, ScrollTrigger, useIsomorphicLayoutEffect } from '@/lib/gsap'
import SectionHeader from '@/components/SectionHeader'

const BIO = `I treat the browser as a canvas and the server as a stage. I build performant systems end-to-end: from shader-optimized frontends to distributed backends that scale. I believe great software lives where engineering rigor meets design intent.`

export default function TheDev() {
  const sectionRef = useRef<HTMLElement>(null)
  const bioRef = useRef<HTMLParagraphElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!sectionRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      if (bioRef.current) {
        const split = new SplitType(bioRef.current, { types: 'lines,words' })
        gsap.from(split.words, {
          opacity: 0.15,
          filter: 'blur(6px)',
          stagger: 0.4,
          ease: 'none',
          scrollTrigger: {
            trigger: bioRef.current!,
            start: 'top 85%',
            end: 'bottom 50%',
            scrub: 1,
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative min-h-screen w-full flex items-center overflow-hidden"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 w-full py-24 md:py-32">
        <SectionHeader
          index="§01"
          label="About"
          title="The Dev"
          subtitle="Bilal Nazih — engineer who designs, designer who ships."
        />

        <p
          ref={bioRef}
          className="editorial-text max-w-3xl"
        >
          {BIO}
        </p>

        <div className="mt-20 font-mono text-xs md:text-sm text-muted">
          <span className="text-accent">const</span> mindset ={' '}
          <span className="text-ink/70">&apos;engineer + artist&apos;</span>;
          <span className="text-muted/40 ml-2">// hi, i&apos;m bilal</span>
        </div>
      </div>
    </section>
  )
}
