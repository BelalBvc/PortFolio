import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

export interface BlogPostMeta {
  slug: string
  title: string
  date: string
  category: string
  cover: string
  excerpt: string
  readingTime: string
}

export interface BlogPost extends BlogPostMeta {
  content: string
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

function getAllMdxFiles(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}

export function getAllPosts(): BlogPostMeta[] {
  return getAllMdxFiles()
    .map((slug) => {
      const fullPath = path.join(BLOG_DIR, `${slug}.mdx`)
      const raw = fs.readFileSync(fullPath, 'utf-8')
      const { data, content } = matter(raw)
      const stats = readingTime(content)
      return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? new Date().toISOString(),
        category: data.category ?? 'General',
        cover: data.cover ?? '',
        excerpt: data.excerpt ?? '',
        readingTime: stats.text,
      } as BlogPostMeta
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): BlogPost | null {
  const fullPath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(fullPath)) return null
  const raw = fs.readFileSync(fullPath, 'utf-8')
  const { data, content } = matter(raw)
  const stats = readingTime(content)
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? new Date().toISOString(),
    category: data.category ?? 'General',
    cover: data.cover ?? '',
    excerpt: data.excerpt ?? '',
    readingTime: stats.text,
    content,
  }
}

export function getAllSlugs(): string[] {
  return getAllMdxFiles()
}