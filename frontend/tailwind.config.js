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
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        love: {
          cream: '#fff7f0',
          blush: '#ffe4ec',
          lavender: '#f3e8ff',
          ink: '#3f1d2e',
        }
      },
      boxShadow: {
        soft: '0 18px 45px rgba(244, 63, 94, 0.12)',
        card: '0 14px 35px rgba(63, 29, 46, 0.08)',
      }
    },
  },
  plugins: [],
}
