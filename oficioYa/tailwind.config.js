/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:    '#e8683a',
        accent:     '#f5b99a',
        background: '#0f0f0f',
        'bg-card':  '#141414',
        'bg-elevated': '#1a1a1a',
        'border-dark': '#1e1e1e',
        'text-main': '#f5f0e8',
        'text-secondary': '#888888',
        'text-muted': '#555555',
        danger:     '#dc2626',
        'danger-dark': '#991b1b',
        whatsapp:   '#25D366',
        star:       '#f59e0b',
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['DM Serif Display', 'serif'],
      },
    },
  },
  plugins: [],
}
