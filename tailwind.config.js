import('tailwindcss').Config

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        websiteFont: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        spotify: ["Spotify", "ui-serif"]
      }
    },
  },
  plugins: [],
}
