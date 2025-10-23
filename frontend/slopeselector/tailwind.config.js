/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'mountain': "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1200 800\"%3E%3Cdefs%3E%3ClinearGradient id=\"sky\" x1=\"0%25\" y1=\"0%25\" x2=\"0%25\" y2=\"100%25\"%3E%3Cstop offset=\"0%25\" style=\"stop-color:%23000B1A;stop-opacity:1\" /%3E%3Cstop offset=\"100%25\" style=\"stop-color:%23001A2E;stop-opacity:1\" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\"1200\" height=\"800\" fill=\"url(%23sky)\"/%3E%3Cpath d=\"M0,600 L200,400 L400,500 L600,300 L800,450 L1000,350 L1200,400 L1200,800 L0,800 Z\" fill=\"%23FFFFFF\" opacity=\"0.1\"/%3E%3C/svg%3E')",
      }
    },
  },
  plugins: [],
}
