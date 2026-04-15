/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  corePlugins: {
    preflight: false,   // <--- DISABLES RESET
  },
  theme: {
    extend: {},
  },
  plugins: [],
}

