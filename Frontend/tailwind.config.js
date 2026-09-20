/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        hotspot: {
          low: "#22c55e",
          med: "#eab308",
          high: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};