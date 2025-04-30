/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./imports/ui/**/*.{js,jsx,ts,tsx}",
    "./client/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#c17030',
        secondary: '#fdf2e3',
        accent: '#fbe4c4'
      },
      fontFamily: {
        comic: ['"Comic Sans MS"', 'cursive', 'sans-serif']
      }
    },
  },
  plugins: [],
}

