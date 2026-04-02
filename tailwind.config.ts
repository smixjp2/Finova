import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:      '#08111f',
        surf:    '#0e1a2e',
        card:    '#13213a',
        border:  'rgba(100,180,255,0.12)',
        acc:     '#00d4aa',
        danger:  '#f43f5e',
        gold:    '#f59e0b',
        purple:  '#a78bfa',
        blue:    '#38bdf8',
        muted:   '#4a6080',
        text:    '#e2e8f0',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
