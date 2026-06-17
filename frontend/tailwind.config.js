/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
      colors: { brand: { DEFAULT: "#4f46e5", dark: "#4338ca", light: "#eef2ff" } },
    },
  },
  plugins: [],
};
