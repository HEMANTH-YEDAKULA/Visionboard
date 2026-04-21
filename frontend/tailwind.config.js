/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        mist: '#eef4ff',
        line: '#d8e2f2',
        brand: '#1d4ed8',
        brandDark: '#1e3a8a',
        mint: '#0f766e',
        gold: '#d97706',
        rose: '#be123c',
      },
      boxShadow: {
        panel: '0 18px 40px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
