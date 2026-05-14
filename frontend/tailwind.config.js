/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary, #c9a227)',
          hover:   'var(--color-secondary, #b08e20)',
        },
        bg: {
          dark:    'var(--color-bg, #0f0f0f)',
          neutral: 'var(--color-surface, #1a1a1a)',
        },
        text: {
          muted:   '#a0a0a0',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
