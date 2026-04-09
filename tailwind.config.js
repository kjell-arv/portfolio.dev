/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Sora"', '"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#faf8f5',
          muted: '#f3f1ec',
          card: '#ffffff',
        },
        ink: {
          DEFAULT: '#0f172a',
          muted: '#475569',
          soft: '#64748b',
        },
      },
      boxShadow: {
        card: '0 1px 0 rgba(15, 23, 42, 0.04), 0 12px 40px -16px rgba(15, 23, 42, 0.12)',
        lift: '0 20px 50px -24px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.04)',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgb(15 23 42 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(15 23 42 / 0.04) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
