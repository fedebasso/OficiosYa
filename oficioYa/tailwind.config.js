/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F6E56',
        accent: '#9FE1CB',
        background: '#f4f4f2',
        'text-main': '#1a1a1a',
        danger: '#dc2626',
        'danger-dark': '#991b1b',
        whatsapp: '#25D366',
      },
    },
  },
  plugins: [],
}
