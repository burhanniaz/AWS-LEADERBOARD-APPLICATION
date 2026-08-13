import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // AWS brand-inspired palette
        squid: {
          DEFAULT: '#232F3E', // AWS Squid Ink
          light: '#2E3B4E',
          dark: '#161E2D',
        },
        smile: {
          DEFAULT: '#FF9900', // AWS Smile Orange
          dark: '#EC7211',
          light: '#FFAC31',
        },
        aws: {
          blue: '#0972D3',
          teal: '#00A1C9',
          green: '#037F0C',
          red: '#D91515',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F2F3F3',
          border: '#D5DBDB',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Amazon Ember', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px rgba(0, 7, 22, 0.10)',
        raised: '0 4px 16px rgba(0, 7, 22, 0.14)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.3s ease-out both',
      },
    },
  },
  plugins: [],
}

export default config
