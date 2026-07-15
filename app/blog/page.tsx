import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'

export const metadata = {
  title: 'Blog — Bilal Nazih',
  description: 'Deep dives on animation, WebGL, and shipping performant interfaces.',
}

export default function BlogIndexPage() {
  const posts = getAllPosts()

  return (
    <main className="relative min-h-screen w-full pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-16">
          <p className="font-mono text-xs tracking-widest2 uppercase text-muted mb-3">
            // the journal
          </p>
          <h1 className="font-display font-bold tracking-tightest text-section leading-[0.9]">
            ALL ARTICLES
          </h1>
        </header>

        <div className="border-t border-white/10">
          {posts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              data-cursor="hover"
              className="group block border-b border-white/10 py-8 transition-colors hover:bg-white/[0.02]"
            >
              <div className="flex items-baseline gap-4 md:gap-8">
                <span className="font-mono text-xs text-muted w-8 flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <h2 className="font-display font-bold tracking-tightest text-[clamp(1.5rem,4vw,3rem)] leading-tight group-hover:text-neon transition-colors">
                    {post.title}
                  </h2>
                  <p className="font-display text-sm text-text/60 mt-2 max-w-xl">
                    {post.excerpt}
                  </p>
                </div>
                <div className="hidden md:flex flex-col items-end flex-shrink-0">
                  <span className="font-mono text-xs text-neon-2 mb-1">
                    {post.category}
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {post.readingTime}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12">
          <Link
            href="/"
            data-cursor="hover"
            className="font-mono text-sm text-muted hover:text-neon transition-colors"
          >
            ← back home
          </Link>
        </div>
      </div>
    </main>
  )
}