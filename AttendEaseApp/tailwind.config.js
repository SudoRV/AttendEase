/** @type {import('tailwindcss').Config} */
module.exports = {
  // Add the paths to all of your component files.
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./app/**/*.{js,jsx,ts,tsx}",  // <--- If using Expo Router
    "./src/**/*.{js,jsx,ts,tsx}",  // <--- If using src folder
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      keyframes: {
        pulsate: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
      },
      animation: {
        pulsate: 'pulsate 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
