/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // NYC Tourist Info Brand Colours - Inspired by cozy living room palette
        primary: {
          DEFAULT: '#0066FF', // Electric Royal Blue - commanding navigation
          light: '#00BFFF',   // Brilliant Sky Blue - interactive elements
          dark: '#003399',    // Darker blue for depth
        },
        accent: {
          DEFAULT: '#FF6B35', // Vibrant Sunset Orange - CTAs and highlights
          light: '#FFD700',   // Pure Gold - luxury touches
          dark: '#E55A2B',    // Deeper orange for contrast
        },
        success: {
          DEFAULT: '#00FF7F', // Electric Spring Green - success states
          light: '#40FF9F',   // Lighter green
          dark: '#00CC66',    // Deeper green
        },
        // Direct colour classes for easy access
        'primary-light': '#00BFFF',   // Brilliant Sky Blue
        'primary-dark': '#003399',    // Darker blue
        'accent-light': '#FFD700',    // Pure Gold
        'accent-dark': '#E55A2B',     // Deeper orange
        'success-light': '#40FF9F',   // Lighter green
        'success-dark': '#00CC66',    // Deeper green
        'neutral-cream': '#FFFACD',   // Lemon Chiffon
        'neutral-warm': '#FFF8E7',    // Warmer variation
      },
    },
  },
  plugins: [],
}
