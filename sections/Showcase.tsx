'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useIsomorphicLayoutEffect } from '@/lib/gsap'
import SectionHeader from '@/components/SectionHeader'

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
    accent: '#C6F24E',
    bg: '#0A0F08',
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
    accent: '#F4F1EA',
    bg: '#0E0E0D',
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
    accent: '#8C8A82',
    bg: '#0D0D0D',
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
    accent: '#C6F24E',
    bg: '#0A0F08',
    link: '#',
  },
]

export default function Showcase() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!sectionRef.current || !trackRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

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

        const projects = gsap.utils.toArray<HTMLElement>('.project-card')
        projects.forEach((proj) => {
          const bg = proj.dataset.bg!
          ScrollTrigger.create({
            trigger: proj,
            containerAnimation: tween,
            start: 'left center',
            end: 'right center',
            onEnter: () => {
              gsap.to(bgRef.current!, { backgroundColor: bg, duration: 0.8 })
            },
            onEnterBack: () => {
              gsap.to(bgRef.current!, { backgroundColor: bg, duration: 0.8 })
            },
          })
        })

        const dots = gsap.utils.toArray<HTMLElement>('.showcase-dot')
        projects.forEach((proj, i) => {
          ScrollTrigger.create({
            trigger: proj,
            containerAnimation: tween,
            start: 'left center',
            end: 'right center',
            onEnter: () => {
              dots.forEach((d, j) => {
                gsap.to(d, { scale: j === i ? 1.5 : 1, backgroundColor: j === i ? PROJECTS[i].accent : 'rgba(244,241,234,0.15)', duration: 0.4 })
              })
            },
            onEnterBack: () => {
              dots.forEach((d, j) => {
                gsap.to(d, { scale: j === i ? 1.5 : 1, backgroundColor: j === i ? PROJECTS[i].accent : 'rgba(244,241,234,0.15)', duration: 0.4 })
              })
            },
          })
        })
      })

      mm.add('(max-width: 767px)', () => {
        gsap.set(sectionRef.current!, { height: 'auto', minHeight: '100vh' })
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
      id="work"
      ref={sectionRef}
      className="relative w-full overflow-hidden md:h-screen"
    >
      <div
        ref={bgRef}
        className="absolute inset-0 z-0 transition-colors duration-700"
        style={{ backgroundColor: '#0B0B0C' }}
      />

      <div className="relative z-10 md:h-full flex items-center showcase-inner">
        <div
          ref={trackRef}
          className="flex gap-8 px-8 md:gap-16 md:px-12 will-change-transform track-inner"
          style={{ width: 'max-content' }}
        >
          <div className="flex-shrink-0 w-full md:w-screen md:h-full flex flex-col justify-center px-4 py-12 md:py-0">
            <SectionHeader
              index="§04"
              label="Work"
              title="Showcase"
              subtitle="Selected projects. Scroll horizontally to explore. The world shifts with each one."
            />
          </div>

          {PROJECTS.map((p) => (
            <div
              key={p.id}
              data-bg={p.bg}
              className="project-card flex-shrink-0 w-full md:w-[60vw] h-auto md:h-[70vh] flex flex-col justify-between p-8 md:p-12 glass rounded-2xl"
              style={{ '--accent': p.accent } as React.CSSProperties}
            >
              <div>
                <div className="flex items-baseline justify-between mb-6">
                  <span className="font-mono text-sm" style={{ color: p.accent }}>
                    {p.id}
                  </span>
                  <span className="font-mono text-[10px] tracking-widest text-muted">{p.year}</span>
                </div>
                <h3
                  className="font-display italic font-bold tracking-tightest text-[clamp(3rem,8vw,8rem)] leading-[0.82] mb-4"
                  style={{ color: p.accent }}
                >
                  {p.title}
                </h3>
                <p className="font-mono text-[10px] tracking-widest2 uppercase text-muted mb-6">
                  {p.category}
                </p>
                <p className="font-body text-base text-ink/70 max-w-md leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="font-mono text-[10px] px-3 py-1 rounded-full border"
                      style={{
                        borderColor: `${p.accent}30`,
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
                  className="font-mono text-xs inline-flex items-center gap-2 hover:gap-4 transition-all"
                  style={{ color: p.accent }}
                >
                  view project →
                </a>
              </div>
            </div>
          ))}

          <div className="flex-shrink-0 w-full md:w-screen md:h-full flex flex-col justify-center px-4 py-12 md:py-0 items-center text-center">
            <p className="font-mono text-[10px] tracking-widest2 uppercase text-muted mb-4">
              § end of showcase
            </p>
            <p className="font-display italic text-2xl text-ink/60">
              More on GitHub →
            </p>
          </div>
        </div>
      </div>

      <div ref={dotsRef} className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-20 gap-2">
        {PROJECTS.map((p, i) => (
          <span
            key={p.id}
            className="showcase-dot w-2 h-2 rounded-full"
            style={{ backgroundColor: 'rgba(244,241,234,0.15)', transition: 'background-color 0.4s ease, transform 0.4s ease' }}
          />
        ))}
      </div>
    </section>
  )
}
