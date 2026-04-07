/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './index.html',
  ],
  theme: {
    extend: {
      // ── Fontes ────────────────────────────────────────────
      fontFamily: {
        display: ['Poppins', 'sans-serif'],   // títulos
        sans:    ['Inter', 'sans-serif'],      // corpo (padrão)
        mono:    ['Roboto Mono', 'monospace'], // preços
      },

      // ── Cores ─────────────────────────────────────────────
      colors: {
        primary:    '#FF6B35',
        secondary:  '#2E294E',
        accent:     '#1B998B',
        background: '#FFF8F5',
        text: {
          DEFAULT:   '#2D3436',
          primary:   '#2D3436',
          secondary: '#5A4F4A',
          muted:     '#8A7B74',
        },
        border:       '#EDE0D9',
        surface:  {
          DEFAULT: '#FFF8F5',
          2:       '#F5EDE8',
        },
        'primary-light': '#FFF0EB',
      },

      // ── Background padrão ─────────────────────────────────
      backgroundColor: {
        background:      '#FFF8F5',
        'primary-light': '#FFF0EB',
        'surface-2':     '#F5EDE8',
      },

      // ── Border color padrão ───────────────────────────────
      borderColor: {
        DEFAULT: '#EDE0D9',
        border:  '#EDE0D9',
      },
    },
  },
  plugins: [],
}

module.exports = config
