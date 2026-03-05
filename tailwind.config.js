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
            DEFAULT: '#5f3711',
            light: '#d4c098',
            dark: '#5f3711',
          },
          'church-accent': {
            DEFAULT: '#e2d5c1',
            light: '#f6f6e2',
          },
          'church-danger': {
            DEFAULT: '#5f3711',
            light: '#d4c098',
          }
        }
      },
    },
    plugins: [],
  };
