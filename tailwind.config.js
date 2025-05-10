/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          deepBlue: '#0F3460',
          teal: '#1A7F8E',
          lavender: '#8D7AE6'
        },
        // Neutral Colors
        neutral: {
          offWhite: '#F8F9FC',
          lightGray: '#E9ECEF',
          mediumGray: '#6C757D',
          darkGray: '#343A40'
        },
        // Accent Colors
        accent: {
          success: '#2ECC71',
          warning: '#F39C12',
          alert: '#E74C3C',
          info: '#3498DB'
        }
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
        'space-grotesk': ['var(--font-space-grotesk)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}