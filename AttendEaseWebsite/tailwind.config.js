/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  corePlugins: {
    preflight: false,   // <--- DISABLES RESET
  },
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        indigo: {
          500: '#6366f1',
          600: '#4f46e5',
        },
        teal: {
          500: '#14b8a6',
          600: '#0d9488',
        },
        neutral: {
          700: '#404040',
          800: '#292524',
        },
        slate: {
          100: '#f1f5f9',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

