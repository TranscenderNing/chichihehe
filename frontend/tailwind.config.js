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
          50: '#fef2f2',
          100: '#ffe1e1',
          200: '#ffc9c9',
          300: '#ffa3a3',
          400: '#ff6b6b',
          500: '#f83b3b',
          600: '#e51d1d',
          700: '#c11414',
          800: '#a01414',
          900: '#841818',
        },
        accent: {
          50: '#effefa',
          100: '#c7fff1',
          200: '#90ffe4',
          300: '#51f7d4',
          400: '#4ecdc4',
          500: '#06b5a0',
          600: '#019283',
          700: '#05746a',
          800: '#0a5c55',
          900: '#0d4c47',
        }
      }
    },
  },
  plugins: [],
}
