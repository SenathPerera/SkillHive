/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff0ee',
          100: '#ffd9d1',
          200: '#ffbfb3',
          300: '#ffa494',
          400: '#ff8a76',
          500: '#ff7057',
          600: '#ff5733', // Main brand color
          700: '#e63e1a',
          800: '#cc2500',
          900: '#b30c00',
        },
      },
      aspectRatio: {
        'w-16': '16',
        'h-9': '9',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
}