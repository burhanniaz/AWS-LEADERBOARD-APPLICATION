import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Chip-logo brand palette — deep violet ink + purple accent glow
        // `ink` is the brand-fixed dark violet surface (header/footer/login),
        // identical in both themes. `squid` is body text/ui-ink and flips via
        // CSS variables so it stays legible in dark mode.
        ink: {
          DEFAULT: '#1B0E33',
          dark: '#100821',
        },
        squid: {
          DEFAULT: 'rgb(var(--color-squid) / <alpha-value>)',
          light: '#2C1B4D',
          dark: '#100821',
        },
        smile: {
          DEFAULT: 'rgb(var(--color-smile) / <alpha-value>)', // primary accent
          dark: 'rgb(var(--color-smile-dark) / <alpha-value>)',
          light: 'rgb(var(--color-smile-light) / <alpha-value>)',
        },
        aws: {
          blue: 'rgb(var(--color-aws-blue) / <alpha-value>)', // links / focus accent
          teal: '#00A1C9',
          green: 'rgb(var(--color-aws-green) / <alpha-value>)',
          red: 'rgb(var(--color-aws-red) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          muted: 'rgb(var(--color-surface-muted) / <alpha-value>)',
          border: 'rgb(var(--color-surface-border) / <alpha-value>)',
        },
        header: {
          DEFAULT: 'rgb(var(--color-header) / <alpha-value>)', // header/footer brand band
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
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.3s ease-out both',
        'fade-in': 'fade-in 0.2s ease-out both',
        'scale-in': 'scale-in 0.2s ease-out both',
        'slide-down': 'slide-down 0.2s ease-out both',
      },
    },
  },
  plugins: [],
}

export default config
