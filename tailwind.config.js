/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          'church-primary': {
            DEFAULT: '#0284c7', // sky-600
            light: '#38bdf8',   // sky-400
            dark: '#0369a1',    // sky-800
          },
          'church-accent': {
            DEFAULT: '#14b8a6', // teal-500
            light: '#2dd4bf',   // teal-400
          },
          'church-danger': {
            DEFAULT: '#e11d48', // rose-600
            light: '#f43f5e',   // rose-500
          }
        }
      },
    },
    plugins: [],
  };