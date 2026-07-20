import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllSlugs, getPostBySlug } from '@/lib/blog'
import { renderMdx } from '@/lib/render-mdx'
import ReadingProgress from '@/components/ReadingProgress'
import BackToJournalCTA from '@/components/BackToJournalCTA'

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: `${post.title} — Bilal Nazih`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string }
}) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const mdx = await renderMdx(post.content)
  const dateObj = new Date(post.date)
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <ReadingProgress />

      <article className="relative min-h-screen w-full pt-32 pb-24">
        <header className="max-w-[720px] mx-auto px-6 mb-16">
          <Link
            href="/#journal"
            data-cursor="hover"
            className="font-mono text-xs text-muted hover:text-accent transition-colors inline-flex items-center gap-2 mb-8"
          >
            ← back to journal
          </Link>

          <div className="flex items-center gap-3 mb-6 font-mono text-xs">
            <span className="text-accent">{post.category}</span>
            <span className="text-muted">·</span>
            <span className="text-muted">{formattedDate}</span>
            <span className="text-muted">·</span>
            <span className="text-muted">{post.readingTime}</span>
          </div>

          <h1 className="font-display italic font-bold tracking-tightest text-[clamp(2rem,6vw,4rem)] leading-[0.95] mb-6 text-ink">
            {post.title}
          </h1>

          <p className="font-body text-lg text-ink/60 leading-relaxed">
            {post.excerpt}
          </p>
        </header>

        {post.cover && (
          <div className="max-w-[1000px] mx-auto px-6 mb-16">
            <div className="rounded-2xl overflow-hidden border border-line aspect-[16/9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover}
                alt={post.title}
                className="w-full h-full object-cover grayscale"
              />
            </div>
          </div>
        )}

        <div className="max-w-[720px] mx-auto px-6">
          <div className="mdx-content [&>p:first-child]:text-[1.15rem] [&>p:first-child:first-letter]:text-[3.5rem] [&>p:first-child:first-letter]:font-display [&>p:first-child:first-letter]:italic [&>p:first-child:first-letter]:font-bold [&>p:first-child:first-letter]:float-left [&>p:first-child:first-letter]:mr-2 [&>p:first-child:first-letter]:leading-[0.8] [&>p:first-child:first-letter]:text-accent">
            {mdx}
          </div>
        </div>

        <footer className="max-w-[720px] mx-auto px-6 mt-24 pt-12 border-t border-line text-center">
          <p className="font-mono text-xs tracking-widest2 uppercase text-muted mb-6">
            § end of article
          </p>
          <BackToJournalCTA />
          <div>
            <Link
              href="/"
              data-cursor="hover"
              className="font-mono text-sm text-muted hover:text-accent transition-colors"
            >
              ← back home
            </Link>
          </div>
        </footer>
      </article>
    </>
  )
}
