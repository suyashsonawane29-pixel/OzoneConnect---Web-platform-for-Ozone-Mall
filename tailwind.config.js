/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf9f2',
          100: '#f5f0df',
          200: '#ebdebc',
          300: '#dec793',
          400: '#cfae69',
          500: '#b89243',
          600: '#a27936',
          700: '#815c2d',
          800: '#6a4a2a',
          900: '#583d26',
          accent: '#C5A059',
          light: '#E6C98B',
          dark: '#937230',
        },
        charcoal: {
          50: '#f7f8f8',
          100: '#eef0f2',
          200: '#d9dde1',
          300: '#b8c1ca',
          400: '#919fad',
          500: '#728190',
          600: '#5b6875',
          700: '#49545f',
          800: '#3c444e',
          900: '#15191E',
          950: '#0c0e11',
        },
        ivory: {
          50: '#fdfcf9',
          100: '#FAF8F5',
          200: '#f5f0e8',
          300: '#ece3d4',
          400: '#ded0b8',
        }
      },
      fontFamily: {
        serif: ['"Cinzel"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'premium': '0 12px 32px -4px rgba(21, 25, 30, 0.08), 0 4px 12px -2px rgba(21, 25, 30, 0.04)',
        'gold-glow': '0 0 25px -5px rgba(197, 160, 89, 0.3)',
      }
    },
  },
  plugins: [],
}
