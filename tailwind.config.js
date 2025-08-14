
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9ebff",
          200: "#b3d7ff",
          300: "#86bcff",
          400: "#5b9bff",
          500: "#3b82f6",
          600: "#2f66d6",
          700: "#254fb0",
          800: "#203f8c",
          900: "#1d356f",
        }
      }
    },
  },
  plugins: [],
}
