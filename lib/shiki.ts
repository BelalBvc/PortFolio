import { createHighlighter } from 'shiki'

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null

const LANGS = ['typescript', 'tsx', 'javascript', 'jsx', 'css', 'bash', 'json', 'html', 'glsl'] as const

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark-dimmed'],
      langs: [...LANGS],
    })
  }
  return highlighterPromise
}

export async function highlightCode(
  code: string,
  lang: string
): Promise<string> {
  const hl = await getHighlighter()
  const normalizedLang = LANGS.includes(lang as any) ? lang : 'typescript'
  return hl.codeToHtml(code, {
    lang: normalizedLang,
    theme: 'github-dark-dimmed',
  })
}