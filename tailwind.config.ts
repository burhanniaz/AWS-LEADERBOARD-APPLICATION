import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Chip-logo brand palette — deep violet ink + purple accent glow
        squid: {
          DEFAULT: '#1B0E33', // deep violet ink
          light: '#2C1B4D',
          dark: '#100821',
        },
        smile: {
          DEFAULT: '#7B5EA7', // primary purple accent
          dark: '#5A3E9E',
          light: '#9F84D4',
        },
        aws: {
          blue: '#8B5CF6', // violet focus/info accent
          teal: '#00A1C9',
          green: '#037F0C',
          red: '#D91515',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F5F2FA', // lavender-tinted muted surface
          border: '#E1D9F0', // lavender-tinted border
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Amazon Ember', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px rgba(27, 14, 51, 0.10)',
        raised: '0 4px 16px rgba(27, 14, 51, 0.14)',
        glow: '0 8px 24px rgba(123, 94, 167, 0.35)',
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
