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
    ts: '#C6F24E',
    tsx: '#C6F24E',
    js: '#F4F1EA',
    jsx: '#F4F1EA',
    css: '#C6F24E',
    bash: '#8C8A82',
    json: '#C6F24E',
  }
  const color = langColor[lang] ?? '#8C8A82'

  return (
    <div className="my-8 rounded-xl overflow-hidden border border-line bg-surface">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-line bg-surface-2">
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
          className="font-mono text-xs px-3 py-1 rounded-md border border-line text-muted hover:text-accent hover:border-accent/40 transition-all"
          style={
            copied
              ? { color: 'var(--accent)', borderColor: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' }
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
          <pre className="font-mono leading-relaxed text-ink/90 whitespace-pre">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  )
}