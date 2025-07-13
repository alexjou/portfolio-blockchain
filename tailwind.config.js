/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3c1053',
        secondary: '#ad2962',
        accent: '#ff9a3c',
      },
    },
  },
  plugins: [],
}
