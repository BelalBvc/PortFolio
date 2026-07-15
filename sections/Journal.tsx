'use client'

import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, useIsomorphicLayoutEffect } from '@/lib/gsap'
import Link from 'next/link'

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
      // Pin the section briefly for a focused reveal
      ScrollTrigger.create({
        trigger: sectionRef.current!,
        start: 'top top',
        end: '+=40vh',
        pin: true,
        pinSpacing: true,
      })

      // Stagger reveal of each row — scrub for smoothness
      const rows = gsap.utils.toArray<HTMLElement>('.journal-row')
      gsap.from(rows, {
        yPercent: 100,
        opacity: 0,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: listRef.current!,
          start: 'top 75%',
          end: 'top 15%',
          scrub: 1.2,
        },
      })

      // Header reveal
      gsap.from('.journal-header', {
        yPercent: 50,
        opacity: 0,
        ease: 'power3.out',
        duration: 0.8,
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: 'top 60%',
        },
      })

      // Floating image follows cursor
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
      const rot = (Math.random() - 0.5) * 16
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
        scale: 0.8,
        duration: 0.3,
        ease: 'power3.out',
      })
    }
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full flex flex-col justify-center overflow-hidden py-20"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
        {/* Header */}
        <div className="journal-header mb-16">
          <p className="font-mono text-xs tracking-widest2 uppercase text-muted mb-3">
            // the journal
          </p>
          <h2 className="font-display font-bold tracking-tightest text-section leading-[0.9]">
            WRITING
          </h2>
          <p className="font-mono text-sm text-muted mt-4 max-w-md">
            Deep dives on animation, WebGL, and shipping performant interfaces.
          </p>
        </div>

        {/* Interactive list */}
        <div ref={listRef} className="border-t border-white/10">
          {SAMPLE_POSTS.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              data-cursor="hover"
              onMouseEnter={() => handleEnter(i)}
              onMouseLeave={handleLeave}
              className="journal-row group block border-b border-white/10 py-6 md:py-8 transition-colors hover:bg-white/[0.02]"
            >
              <div className="flex items-baseline gap-4 md:gap-8">
                <span className="font-mono text-xs text-muted w-8 flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3
                  className={`font-display font-bold tracking-tightest text-[clamp(1.5rem,4vw,3.5rem)] leading-tight transition-colors duration-300 ${
                    activeIndex === i ? 'text-neon' : 'text-text'
                  }`}
                >
                  {post.title}
                </h3>
                <div className="hidden md:flex flex-col items-end ml-auto flex-shrink-0">
                  <span className="font-mono text-xs text-neon-2 mb-1">
                    {post.category}
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {post.readingTime}
                  </span>
                </div>
              </div>
              {/* Mobile meta */}
              <div className="md:hidden flex gap-3 mt-2 pl-12 font-mono text-xs text-muted">
                <span className="text-neon-2">{post.category}</span>
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
            className="font-mono text-sm text-muted hover:text-neon transition-colors inline-flex items-center gap-2"
          >
            all articles →
          </Link>
        </div>
      </div>

      {/* Floating cover image that follows cursor */}
      <div
        ref={imgRef}
        className="fixed top-0 left-0 z-40 pointer-events-none opacity-0 scale-80 will-change-transform"
        style={{ width: '280px', height: '180px' }}
      >
        {SAMPLE_POSTS.map((post, i) => (
          <div
            key={post.slug}
            className="absolute inset-0 rounded-lg overflow-hidden border border-white/10 transition-opacity duration-300"
            style={{
              opacity: activeIndex === i ? 1 : 0,
              mixBlendMode: 'luminosity',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  )
}