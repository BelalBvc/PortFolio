'use client'

import { useState } from 'react'

interface CodeBlockProps {
  code: string
  lang?: string
  filename?: string
  highlightedHtml?: string
}

export default function CodeBlock({
  code,
  lang = 'ts',
  filename,
  highlightedHtml,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const langColor: Record<string, string> = {
    ts: '#00E5FF',
    tsx: '#00E5FF',
    js: '#FF2D95',
    jsx: '#FF2D95',
    css: '#00FF88',
    bash: '#B388FF',
    json: '#FFB347',
  }
  const color = langColor[lang] ?? '#8A8A93'

  return (
    <div className="my-8 rounded-xl overflow-hidden border border-white/8 bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-surface-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <span
            className="font-mono text-xs font-medium"
            style={{ color }}
          >
            {filename ?? lang}
          </span>
        </div>
        <button
          onClick={handleCopy}
          data-cursor="hover"
          className="font-mono text-xs px-3 py-1 rounded-md border border-white/10 text-muted hover:text-neon hover:border-neon/40 transition-all"
          style={
            copied
              ? { color: 'var(--neon)', borderColor: 'var(--neon)', boxShadow: '0 0 12px var(--neon)' }
              : undefined
          }
        >
          {copied ? '✓ COPIED' : 'COPY'}
        </button>
      </div>

      {/* Code body */}
      <div className="overflow-x-auto p-4 text-sm">
        {highlightedHtml ? (
          <pre
            className="font-mono leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre className="font-mono leading-relaxed text-text/90 whitespace-pre">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  )
}