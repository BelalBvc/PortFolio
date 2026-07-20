'use client'

import { useRef } from 'react'
import SplitType from 'split-type'
import { gsap, ScrollTrigger, useIsomorphicLayoutEffect } from '@/lib/gsap'

interface TextRevealProps {
  children: string
  className?: string
  as?: keyof JSX.IntrinsicElements
  /** Scroll scrub */
  scrub?: boolean | number
  start?: string
  end?: string
  colorTo?: string
}

export default function TextReveal({
  children,
  className = '',
  as: Tag = 'div',
  scrub = 1.5,
  start = 'top 80%',
  end = 'top 30%',
  colorTo = 'var(--accent)',
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const split = new SplitType(ref.current, { types: 'chars,words' })
    const ctx = gsap.context(() => {
      gsap.from(split.chars, {
        yPercent: 120,
        opacity: 0,
        stagger: 0.02,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current!,
          start,
          end,
          scrub,
        },
      })
      gsap.to(split.chars, {
        color: colorTo,
        stagger: 0.02,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current!,
          start,
          end: 'top 40%',
          scrub,
        },
      })
    }, ref)

    return () => {
      ctx.revert()
      split.revert()
    }
  }, [scrub, start, end, colorTo])

  const Component = Tag as any
  return (
    <Component ref={ref} className={className}>
      {children}
    </Component>
  )
}