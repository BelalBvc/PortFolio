import type { Metadata } from 'next'
import { Fraunces, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '900'],
  style: ['normal', 'italic'],
})

const body = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-body',
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
    'Engineer who designs, designer who ships. Interactive portfolio crafted with editorial precision.',
  keywords: ['Full Stack Developer', 'Web Engineer', 'React', 'Node.js', 'Cloud', 'Portfolio'],
  openGraph: {
    title: 'Bilal Nazih — Full Stack Developer',
    description: 'Interactive portfolio of a Full Stack Engineer.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-icon.png',
  },
}

import CursorProvider from '@/components/CursorProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        {children}
        <CursorProvider />
        <div className="noise-overlay" aria-hidden />
        <div className="baseline-grid" aria-hidden />
      </body>
    </html>
  )
}
