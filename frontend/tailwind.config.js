/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This tells Tailwind to scan all component files in the src folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}