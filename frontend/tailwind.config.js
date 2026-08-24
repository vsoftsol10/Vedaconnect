/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "#F5A623",
          goldDark: "#E0941A",
          green: "#4CAF3C",
          greenDark: "#3C9130",
          navy: "#1A1D23",
        },
      },
    },
  },
  plugins: [],
};
