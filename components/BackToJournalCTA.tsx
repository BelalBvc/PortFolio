'use client'

import Link from 'next/link'
import MagneticButton from './MagneticButton'

export default function BackToJournalCTA() {
  return (
    <Link href="/#journal">
      <MagneticButton strength={0.4} className="mb-8">
        <span className="font-display font-bold tracking-tightest text-2xl gradient-text">
          READ MORE →
        </span>
      </MagneticButton>
    </Link>
  )
}