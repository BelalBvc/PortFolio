'use client'

import TextReveal from './TextReveal'

interface SectionHeaderProps {
  index: string
  label: string
  title?: string
  subtitle?: string
}

export default function SectionHeader({ index, label, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="journal-header mb-16 md:mb-24">
      <div className="flex items-baseline gap-4 mb-4">
        <span className="font-mono text-[10px] tracking-widest2 text-accent">{index}</span>
        <span className="font-mono text-[11px] tracking-widest2 uppercase text-muted">
          / {label}
        </span>
      </div>
      {title && (
        <TextReveal
          as="h2"
          className="font-display italic font-bold tracking-tightest text-section leading-[0.85]"
          colorTo="var(--ink)"
        >
          {title}
        </TextReveal>
      )}
      {subtitle && (
        <p className="font-body text-sm text-muted mt-4 max-w-md">{subtitle}</p>
      )}
    </div>
  )
}
