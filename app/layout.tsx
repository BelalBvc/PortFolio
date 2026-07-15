import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  title: 'Bilal Nazih — Full Stack Developer',
  description:
    'Interactive portfolio of Bilal Nazih, a Full Stack Engineer crafting performant, beautiful web experiences.',
  keywords: ['Full Stack Developer', 'Web Engineer', 'React', 'Node.js', 'Cloud', 'Portfolio'],
  openGraph: {
    title: 'Bilal Nazih — Full Stack Developer',
    description: 'Interactive portfolio of a Full Stack Engineer.',
    type: 'website',
  },
}

import CursorProvider from '@/components/CursorProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        {children}
        <CursorProvider />
        <div className="noise-overlay" aria-hidden />
      </body>
    </html>
  )
}