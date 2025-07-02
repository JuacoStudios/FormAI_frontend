/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        'dark-gray': '#1C1C1E',
        red: '#FF3B30',
        white: '#FFFFFF',
        'gray-light': '#D1D1D6',
      },
      boxShadow: {
        glow: '0 0 16px 4px #FF3B30',
      },
    },
  },
  plugins: [],
  presets: [require('nativewind/tailwind/native')],
}; 