/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'apush-blue': '#1e3a5f',
        'apush-gold': '#c9a227',
        'apush-red': '#8b0000',
      }
    },
  },
  plugins: [],
}