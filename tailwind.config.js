/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        crema: '#FBF7F0',
        salvia: {
          DEFAULT: '#7C9A6B',
          scuro: '#5F7A52',
          chiaro: '#A9BE9C',
          tenue: '#EDF1E8',
        },
        terracotta: {
          DEFAULT: '#C97B4A',
          tenue: '#F6E9DF',
        },
        azzurro: {
          DEFAULT: '#4A90C9',
          tenue: '#E1ECF6',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 6px 24px -10px rgba(60, 50, 40, 0.18)',
        nav: '0 -6px 28px -10px rgba(60, 50, 40, 0.14)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
}
