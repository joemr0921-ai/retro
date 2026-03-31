import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50:  '#fff1ee',
          100: '#ffe0d8',
          200: '#ffc4b5',
          300: '#ff9e87',
          400: '#ff6b47',
          500: '#f94a22',
          600: '#e62d07',
          700: '#bf2208',
          800: '#9d1f0f',
          900: '#821f12',
          950: '#470c05',
        },
        teal: {
          50:  '#effefa',
          100: '#c8fff3',
          200: '#92ffe7',
          300: '#54f7d8',
          400: '#20e6c3',
          500: '#06c9aa',
          600: '#02a38b',
          700: '#068271',
          800: '#0a665c',
          900: '#0d544c',
          950: '#003330',
        },
        dark: {
          900: '#0F0F0F',
          800: '#1A1A1A',
          700: '#2A2A2A',
          600: '#3A3A3A',
        },
        cream: '#FAFAF0',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-inter)',          'system-ui', 'sans-serif'],
        mono:    ['var(--font-space-mono)',     'monospace'],
      },
      fontSize: {
        'display-xl': ['5rem',    { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['3.75rem', { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['3rem',    { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease-out forwards',
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'retro-grid': [
          'linear-gradient(rgba(255,107,71,0.07) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(255,107,71,0.07) 1px, transparent 1px)',
        ].join(', '),
      },
      backgroundSize: {
        'retro-grid': '40px 40px',
      },
      boxShadow: {
        'retro':       '4px 4px 0px 0px #0F0F0F',
        'retro-coral': '4px 4px 0px 0px #ff6b47',
        'retro-teal':  '4px 4px 0px 0px #06c9aa',
        'glow-coral':  '0 0 40px rgba(255, 107, 71, 0.3)',
        'glow-teal':   '0 0 40px rgba(6, 201, 170, 0.3)',
      },
    },
  },
  plugins: [],
}

export default config
