/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Segoe UI", "system-ui", "sans-serif"],
        display: ["Manrope", "Plus Jakarta Sans", "sans-serif"],
      },
      colors: {
        rail: {
          50: "#eef6ff",
          100: "#d9ebff",
          500: "#2f7de1",
          700: "#1d4f9c",
          900: "#0b1b33",
          950: "#071222",
        },
        amberglow: "#f4b942",
      },
      boxShadow: {
        glass: "0 18px 50px rgba(7, 18, 34, 0.28)",
      },
    },
  },
  plugins: [],
};
