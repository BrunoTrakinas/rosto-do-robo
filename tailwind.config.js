/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // <- ESSENCIAL pro toggle via classe "dark" no <html>
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {}
  },
  plugins: []
};
