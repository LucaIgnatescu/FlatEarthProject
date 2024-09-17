/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'orange': '#ff8400',
        'red': '#ff0000',
        'green': '#3acabb',
        'yellow': '#faff00'
      },
      animation: {
        fade: 'fadeIn 1.25s ease-in-out',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}

