'use client'

import Link from 'next/link'

export default function BackToJournalCTA() {
  return (
    <Link href="/#journal">
      <button
        data-cursor="hover"
        className="font-display italic font-bold text-2xl text-accent hover:text-ink transition-colors duration-300 mb-8"
      >
        READ MORE →
      </button>
    </Link>
  )
}
