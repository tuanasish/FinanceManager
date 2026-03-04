/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50',
        danger: '#F44336',
        textDark: '#1E293B',
      }
    },
  },
  plugins: [],
}
