'use client'

import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, useIsomorphicLayoutEffect } from '@/lib/gsap'
import Link from 'next/link'
import SectionHeader from '@/components/SectionHeader'

interface JournalPost {
  slug: string
  title: string
  category: string
  date: string
  readingTime: string
  cover: string
}

const SAMPLE_POSTS: JournalPost[] = [
  {
    slug: 'scroll-driven-portfolio-gsap',
    title: 'Building a Scroll-Driven Portfolio with GSAP',
    category: 'Animation',
    date: '2025-07-15',
    readingTime: '8 min read',
    cover:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  },
  {
    slug: 'shader-morph-threejs',
    title: 'Shader Morphing in Three.js: A Practical Guide',
    category: 'WebGL',
    date: '2025-06-28',
    readingTime: '12 min read',
    cover:
      'https://images.unsplash.com/photo-1633354438632-67d4c3f4d3e4?w=800&q=80',
  },
  {
    slug: 'react-server-components-edge',
    title: 'React Server Components at the Edge',
    category: 'Architecture',
    date: '2025-06-10',
    readingTime: '10 min read',
    cover:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
  },
  {
    slug: 'lenis-smooth-scroll-internals',
    title: 'How Lenis Achieves 60fps Smooth Scroll',
    category: 'Performance',
    date: '2025-05-22',
    readingTime: '6 min read',
    cover:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  },
]

export default function Journal() {
  const sectionRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useIsomorphicLayoutEffect(() => {
    if (!sectionRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>('.journal-row')
      gsap.from(rows, {
        yPercent: 60,
        opacity: 0,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: listRef.current!,
          start: 'top 80%',
          end: 'top 15%',
          scrub: 1,
        },
      })

      const img = imgRef.current!
      const xTo = gsap.quickTo(img, 'x', { duration: 0.5, ease: 'power3' })
      const yTo = gsap.quickTo(img, 'y', { duration: 0.5, ease: 'power3' })
      const rotTo = gsap.quickTo(img, 'rotation', { duration: 0.6, ease: 'power3' })

      const onMove = (e: MouseEvent) => {
        xTo(e.clientX + 24)
        yTo(e.clientY - 100)
      }
      window.addEventListener('mousemove', onMove)
      return () => window.removeEventListener('mousemove', onMove)
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleEnter = (index: number) => {
    setActiveIndex(index)
    if (imgRef.current) {
      const rot = (Math.random() - 0.5) * 12
      gsap.to(imgRef.current, {
        opacity: 1,
        scale: 1,
        rotation: rot,
        duration: 0.4,
        ease: 'power3.out',
      })
    }
  }

  const handleLeave = () => {
    setActiveIndex(null)
    if (imgRef.current) {
      gsap.to(imgRef.current, {
        opacity: 0,
        scale: 0.85,
        duration: 0.3,
        ease: 'power3.out',
      })
    }
  }

  return (
    <section
      id="journal"
      ref={sectionRef}
      className="relative min-h-screen w-full flex flex-col justify-center overflow-hidden py-20"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 w-full">
        <SectionHeader
          index="§03"
          label="Writing"
          title="The Journal"
          subtitle="Deep dives on animation, WebGL, and shipping performant interfaces."
        />

        <div ref={listRef} className="border-t border-line">
          {SAMPLE_POSTS.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              data-cursor="hover"
              onMouseEnter={() => handleEnter(i)}
              onMouseLeave={handleLeave}
              className="journal-row group block border-b border-line py-6 md:py-8 transition-colors hover:bg-ink/[0.01]"
            >
              <div className="flex items-baseline gap-4 md:gap-6">
                <span className="font-mono text-[11px] text-muted w-8 flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3
                  className={`font-display italic font-bold tracking-tightest text-[clamp(1.25rem,3.5vw,3rem)] leading-tight transition-colors duration-300 ${
                    activeIndex === i ? 'text-accent' : 'text-ink'
                  }`}
                >
                  {post.title}
                </h3>
                <div className="hidden md:flex flex-col items-end ml-auto flex-shrink-0">
                  <span className="font-mono text-[10px] tracking-widest uppercase text-accent mb-1">
                    {post.category}
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    {post.readingTime}
                  </span>
                </div>
              </div>
              <div className="md:hidden flex gap-3 mt-2 pl-12 font-mono text-[10px] text-muted">
                <span className="text-accent">{post.category}</span>
                <span>·</span>
                <span>{post.readingTime}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-right">
          <Link
            href="/blog"
            data-cursor="hover"
            className="font-mono text-xs text-muted hover:text-accent transition-colors inline-flex items-center gap-2"
          >
            all articles →
          </Link>
        </div>
      </div>

      <div
        ref={imgRef}
        className="fixed top-0 left-0 z-40 pointer-events-none opacity-0 scale-85 will-change-transform"
        style={{ width: '280px', height: '180px' }}
      >
        {SAMPLE_POSTS.map((post, i) => (
          <div
            key={post.slug}
            className="absolute inset-0 rounded-lg overflow-hidden border border-line transition-opacity duration-300"
            style={{
              opacity: activeIndex === i ? 1 : 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover}
              alt=""
              className="w-full h-full object-cover grayscale"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
