/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: 'rgb(var(--theme-bg) / <alpha-value>)',
        card: 'rgb(var(--theme-panel) / <alpha-value>)',
        ice: 'rgb(var(--theme-muted) / <alpha-value>)',
        frost: 'rgb(var(--theme-text) / <alpha-value>)',
        amber: 'rgb(var(--theme-accent) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Geist', 'sans-serif'],
        sans: ['Geist', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
