'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { getLenis } from '@/lib/lenis-instance'

interface NavItem {
  id: string
  index: string
  label: string
}

const ITEMS: NavItem[] = [
  { id: 'hero', index: '§00', label: 'Home' },
  { id: 'about', index: '§01', label: 'About' },
  { id: 'stack', index: '§02', label: 'Stack' },
  { id: 'journal', index: '§03', label: 'Writing' },
  { id: 'work', index: '§04', label: 'Work' },
  { id: 'play', index: '§05', label: 'Play' },
  { id: 'contact', index: '§06', label: 'Contact' },
]

export default function Nav() {
  const [active, setActive] = useState('hero')
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      ITEMS.forEach((item) => {
        const el = document.getElementById(item.id)
        if (!el) return
        ScrollTrigger.create({
          trigger: el,
          start: 'top 30%',
          end: 'bottom 30%',
          onEnter: () => setActive(item.id),
          onEnterBack: () => setActive(item.id),
        })
      })

      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          if (barRef.current) {
            barRef.current.style.transform = `scaleX(${self.progress})`
          }
        },
      })
    })

    return () => ctx.revert()
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(el, { offset: 0, duration: 1.2, easing: (t: number) => 1 - Math.pow(1 - t, 4) })
    } else {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <div ref={barRef} className="nav-progress" style={{ transform: 'scaleX(0)' }} />

      <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex items-center justify-between h-16 md:h-20">
          <button
            onClick={() => scrollTo('hero')}
            data-cursor="hover"
            className="font-display italic font-bold text-lg text-ink tracking-tightest"
          >
            BN
          </button>

          <div className="hidden md:flex items-center gap-8">
            {ITEMS.filter((i) => i.id !== 'hero').map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                data-cursor="hover"
                className={`flex items-center gap-2 transition-colors duration-300 ${
                  active === item.id ? 'text-accent' : 'text-muted hover:text-ink'
                }`}
              >
                <span className="font-mono text-[10px] tracking-widest">{item.index}</span>
                <span className="font-body text-xs tracking-widest2 uppercase">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="md:hidden flex items-center gap-4">
            <span className="font-mono text-[10px] text-accent tracking-widest">
              {ITEMS.find((i) => i.id === active)?.index ?? '§00'}
            </span>
          </div>
        </div>
      </nav>
    </>
  )
}
