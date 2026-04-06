/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        text: '#50656a',
        'text-h': '#183239',
        bg: '#f6efe5',
        accent: '#b85425',
        'accent-strong': '#8d3f1d',
        'accent-soft': 'rgba(184, 84, 37, 0.12)',
        'panel-muted': 'rgba(255, 248, 240, 0.88)',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Trebuchet MS', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      fontSize: {
        sm: '14px',
        base: '17px',
      },
      letterSpacing: {
        wide: '0.01em',
        wider: '0.12em',
        widest: '0.16em',
      },
      borderRadius: {
        lg: '14px',
        xl: '18px',
        full: '28px',
        '999': '999px',
      },
      spacing: {
        '70': '17.5rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
