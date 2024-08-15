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
        'green': '#3acabb'
      }
    },
  },
  plugins: [],
}

