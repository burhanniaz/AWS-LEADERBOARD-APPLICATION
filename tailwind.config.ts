import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Builder Console palette — warm ink + AWS orange accent.
        // `ink` is the brand-fixed dark surface (rail/footer/login), identical
        // in both themes. `squid` is body text/ui-ink and flips via CSS
        // variables so it stays legible in dark mode.
        ink: {
          DEFAULT: '#120D09',
          dark: '#0A0705',
        },
        squid: {
          DEFAULT: 'rgb(var(--color-squid) / <alpha-value>)',
          light: '#3D3020',
          dark: '#0A0705',
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
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 4px rgba(18, 13, 9, 0.10)',
        raised: '0 4px 16px rgba(18, 13, 9, 0.14)',
        glow: '0 8px 24px rgba(255, 153, 0, 0.35)',
        // Glass pane: a faint inner top highlight (the lit edge of frosted
        // glass) over a soft ambient drop shadow.
        glass: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 4px 24px rgba(18, 13, 9, 0.10)',
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
        // Page-change reveal: a calm settle — soft fade, gentle rise, a whisper
        // of blur clearing — so a new route eases in rather than snapping.
        'page-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)', filter: 'blur(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.3s ease-out both',
        'fade-in': 'fade-in 0.2s ease-out both',
        'scale-in': 'scale-in 0.2s ease-out both',
        'slide-down': 'slide-down 0.2s ease-out both',
        'page-in': 'page-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}

export default config
