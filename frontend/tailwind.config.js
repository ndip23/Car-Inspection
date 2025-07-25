/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light Mode
        'light-bg': '#F3F4F6',        // Off-white background
        'light-card': '#FFFFFF',      // White cards
        'light-text': '#111827',      // Dark gray text
        'light-text-secondary': '#6B7280', // Medium gray text
        'light-border': '#E5E7EB',    // Light gray border
        
        // Dark Mode
        'dark-bg': '#0B1120',         // Deep navy background
        'dark-card': '#171F2E',       // Dark blue-gray cards
        'dark-text': '#E5E7EB',       // Light gray text
        'dark-text-secondary': '#9CA3AF', // Medium gray text
        'dark-border': '#374151',     // Dark gray border

        // Accent Colors (work in both modes)
        'primary': '#10B981',         // Vibrant Green
        'primary-hover': '#059669',   // Darker Green
        'secondary': '#F59E0B',       // Vibrant Orange
        'secondary-hover': '#D97706', // Darker Orange
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}