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
        bg: '#0A0A0B',
        surface: '#121214',
        'surface-2': '#1A1A1F',
        neon: '#00FF88',
        'neon-2': '#00E5FF',
        'neon-3': '#FF2D95',
        muted: '#8A8A93',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        hero: 'clamp(4rem, 2rem + 16vw, 18vw)',
        section: 'clamp(2.5rem, 1rem + 6vw, 6rem)',
        sub: 'clamp(1.5rem, 1rem + 2vw, 2.5rem)',
      },
      letterSpacing: {
        tightest: '-0.04em',
        widest2: '0.1em',
      },
    },
  },
  plugins: [],
}
export default config