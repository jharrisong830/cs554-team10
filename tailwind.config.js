import('tailwindcss').Config

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        spotify: ["Spotify", "ui-serif"]
      }
    },
  },
  plugins: [],
}