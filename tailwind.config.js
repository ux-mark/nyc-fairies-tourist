/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A5FFF',
          light: '#3B82F6',
          dark: '#1E3A8A',
        },
        accent: {
          DEFAULT: '#F59E42',
          light: '#FBBF24',
          dark: '#B45309',
        },
      },
    },
  },
  plugins: [],
}
