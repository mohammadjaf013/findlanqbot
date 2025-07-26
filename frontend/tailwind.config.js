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
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        brand: {
          primary: '#4385f6',
          secondary: '#1a73e8',
          light: '#e8f0fe',
          dark: '#1c4587',
        }
      },
      fontFamily: {
        'persian': ['Vazir', 'Tahoma', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 