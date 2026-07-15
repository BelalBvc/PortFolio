'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useIsomorphicLayoutEffect } from '@/lib/gsap'

interface Project {
  id: string
  title: string
  category: string
  year: string
  description: string
  stack: string[]
  accent: string
  bg: string
  link: string
}

const PROJECTS: Project[] = [
  {
    id: '01',
    title: 'NEXUS',
    category: 'Real-time Platform',
    year: '2025',
    description:
      'A real-time collaboration platform handling 10k+ concurrent users with WebSocket streaming and CRDT sync.',
    stack: ['Next.js', 'Node', 'Redis', 'WebSocket'],
    accent: '#00FF88',
    bg: '#0A1A0F',
    link: '#',
  },
  {
    id: '02',
    title: 'AURORA',
    category: 'Data Visualization',
    year: '2024',
    description:
      'Interactive 3D data visualization dashboard for financial analytics with WebGL rendering.',
    stack: ['React', 'Three.js', 'D3', 'Python'],
    accent: '#00E5FF',
    bg: '#0A151A',
    link: '#',
  },
  {
    id: '03',
    title: 'FORGE',
    category: 'DevOps Tooling',
    year: '2024',
    description:
      'Internal CI/CD orchestration tool reducing deploy times by 70% across 50+ microservices.',
    stack: ['Go', 'Docker', 'K8s', 'gRPC'],
    accent: '#FF2D95',
    bg: '#1A0A12',
    link: '#',
  },
  {
    id: '04',
    title: 'PRISM',
    category: 'E-commerce',
    year: '2023',
    description:
      'Headless e-commerce platform with edge-rendered product pages and sub-100ms TTFB worldwide.',
    stack: ['Next.js', 'Stripe', 'Postgres', 'Vercel'],
    accent: '#B388FF',
    bg: '#120A1A',
    link: '#',
  },
]

export default function Showcase() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!sectionRef.current || !trackRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // Desktop: horizontal pin scroll
      mm.add('(min-width: 768px)', () => {
        const track = trackRef.current!
        const totalScroll = track.scrollWidth - window.innerWidth

        const tween = gsap.to(track, {
          x: -totalScroll,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current!,
            start: 'top top',
            end: () => `+=${totalScroll}`,
            pin: true,
            scrub: 2,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })

        // Per-project background color tween
        const projects = gsap.utils.toArray<HTMLElement>('.project-card')
        projects.forEach((proj) => {
          const bg = proj.dataset.bg!
          const accent = proj.dataset.accent!
          ScrollTrigger.create({
            trigger: proj,
            containerAnimation: tween,
            start: 'left center',
            end: 'right center',
            onEnter: () => {
              gsap.to(bgRef.current!, { backgroundColor: bg, duration: 0.8 })
              document.documentElement.style.setProperty('--neon', accent)
            },
            onEnterBack: () => {
              gsap.to(bgRef.current!, { backgroundColor: bg, duration: 0.8 })
              document.documentElement.style.setProperty('--neon', accent)
            },
          })
        })
      })

      // Mobile: vertical stack, no pin, section auto-height
      mm.add('(max-width: 767px)', () => {
        // Make section auto-height on mobile
        gsap.set(sectionRef.current!, { height: 'auto', minHeight: '100vh' })
        // Release the inner container from h-full
        gsap.set('.showcase-inner', { height: 'auto', flexDirection: 'column', gap: '1.5rem' })
        gsap.set('.track-inner', { width: '100%', flexDirection: 'column', gap: '2rem' })

        gsap.fromTo(
          '.project-card',
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current!,
              start: 'top 70%',
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden md:h-screen"
    >
      {/* Dynamic background */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-0 transition-colors duration-700"
        style={{ backgroundColor: '#0A0A0B' }}
      />

      <div className="relative z-10 md:h-full flex items-center showcase-inner">
        <div
          ref={trackRef}
          className="flex gap-8 px-8 md:gap-16 md:px-16 will-change-transform track-inner"
          style={{ width: 'max-content' }}
        >
          {/* Intro panel */}
          <div className="flex-shrink-0 w-full md:w-screen md:h-full flex flex-col justify-center px-4 py-12 md:py-0">
            <p className="font-mono text-xs tracking-widest2 uppercase text-muted mb-4">
              // selected work
            </p>
            <h2 className="font-display font-bold tracking-tightest text-section leading-[0.9]">
              SHOW
              <br />
              <span className="gradient-text">CASE</span>
            </h2>
            <p className="font-mono text-sm text-muted mt-6 max-w-sm">
              Scroll to explore projects horizontally. The world shifts color
              with each one.
            </p>
          </div>

          {/* Project cards */}
          {PROJECTS.map((p) => (
            <div
              key={p.id}
              data-bg={p.bg}
              data-accent={p.accent}
              className="project-card flex-shrink-0 w-full md:w-[60vw] h-auto md:h-[70vh] flex flex-col justify-between p-8 md:p-12 glass rounded-2xl"
            >
              <div>
                <div className="flex items-baseline justify-between mb-6">
                  <span className="font-mono text-sm" style={{ color: p.accent }}>
                    {p.id}
                  </span>
                  <span className="font-mono text-xs text-muted">{p.year}</span>
                </div>
                <h3
                  className="font-display font-bold tracking-tightest text-[clamp(3rem,8vw,8rem)] leading-[0.85] mb-4"
                  style={{ color: p.accent }}
                >
                  {p.title}
                </h3>
                <p className="font-mono text-xs tracking-widest2 uppercase text-muted mb-6">
                  {p.category}
                </p>
                <p className="font-display text-lg text-text/80 max-w-md leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="font-mono text-xs px-3 py-1 rounded-full border"
                      style={{
                        borderColor: `${p.accent}40`,
                        color: p.accent,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <a
                  href={p.link}
                  data-cursor="hover"
                  className="font-mono text-sm inline-flex items-center gap-2 hover:gap-4 transition-all"
                  style={{ color: p.accent }}
                >
                  view project →
                </a>
              </div>
            </div>
          ))}

          {/* Outro panel */}
          <div className="flex-shrink-0 w-full md:w-screen md:h-full flex flex-col justify-center px-4 py-12 md:py-0 text-center">
            <p className="font-mono text-xs tracking-widest2 uppercase text-muted mb-4">
              // end of showcase
            </p>
            <p className="font-display text-sub text-text/70">
              More on GitHub →
            </p>
          </div>
        </div>
      </div>

      {/* Progress dots (desktop) */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-20 gap-2">
        {PROJECTS.map((p) => (
          <span
            key={p.id}
            className="w-2 h-2 rounded-full bg-white/20"
          />
        ))}
      </div>
    </section>
  )
}