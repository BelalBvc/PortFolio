import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './sections/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B0C',
        surface: '#121212',
        'surface-2': '#1A1A1A',
        accent: '#C6F24E',
        ink: '#F4F1EA',
        muted: '#8C8A82',
        line: 'rgba(244,241,234,0.10)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        hero: 'clamp(4rem, 3rem + 14vw, 16vw)',
        section: 'clamp(2.5rem, 1rem + 6vw, 6rem)',
        sub: 'clamp(1.25rem, 1rem + 2vw, 2.25rem)',
      },
      letterSpacing: {
        tightest: '-0.03em',
        widest2: '0.12em',
      },
    },
  },
  plugins: [],
}
export default config
