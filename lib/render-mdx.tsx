import { compileMDX } from 'next-mdx-remote/rsc'
import CodeBlock from '@/components/mdx/CodeBlock'
import Callout from '@/components/mdx/Callout'
import { highlightCode } from './shiki'

async function preprocessCodeFences(content: string): Promise<string> {
  const fenceRegex = /```(\w+)\n([\s\S]*?)```/g
  const matches: { lang: string; code: string; index: number; full: string }[] = []
  let m: RegExpExecArray | null
  while ((m = fenceRegex.exec(content)) !== null) {
    matches.push({ lang: m[1], code: m[2].replace(/\n$/, ''), index: m.index, full: m[0] })
  }

  let result = content
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i]
    const html = await highlightCode(match.code, match.lang)
    const replacement = `<CodeBlock lang="${match.lang}" code={${JSON.stringify(match.code)}} highlightedHtml={${JSON.stringify(html)}} />`
    result = result.slice(0, match.index) + replacement + result.slice(match.index + match.full.length)
  }
  return result
}

const components = {
  CodeBlock,
  Callout,
  h1: (props: any) => (
    <h1 className="font-display italic font-bold text-2xl text-accent mt-12 mb-4" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="font-display italic font-bold text-xl text-ink mt-10 mb-3" {...props} />
  ),
  h3: (props: any) => (
    <h3 className="font-display font-medium text-lg text-ink mt-8 mb-2" {...props} />
  ),
  p: (props: any) => (
    <p className="text-ink/75 leading-[1.8] mb-5 text-[1.05rem]" {...props} />
  ),
  a: (props: any) => (
    <a className="text-accent underline underline-offset-4 hover:text-ink transition-colors" {...props} />
  ),
  ul: (props: any) => <ul className="list-none mb-5 space-y-2" {...props} />,
  ol: (props: any) => <ol className="list-decimal list-inside mb-5 space-y-2" {...props} />,
  li: (props: any) => <li className="text-ink/75 leading-relaxed pl-2" {...props} />,
  blockquote: (props: any) => (
    <blockquote
      className="border-l-2 border-accent pl-5 my-6 italic text-ink/60 text-lg"
      {...props}
    />
  ),
  inlineCode: (props: any) => (
    <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-surface-2 text-accent" {...props} />
  ),
  hr: () => <hr className="border-line my-10" />,
  strong: (props: any) => <strong className="text-ink font-bold" {...props} />,
}

export async function renderMdx(content: string) {
  const processed = await preprocessCodeFences(content)
  const { content: mdxContent } = await compileMDX({
    source: processed,
    components,
    options: { parseFrontmatter: true },
  })
  return mdxContent
}
