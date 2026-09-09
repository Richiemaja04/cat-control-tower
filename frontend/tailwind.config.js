/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cat: {
          yellow: '#FFB800',
          yellowLight: '#FFC700',
          black: '#0A0C10',
          surface: '#12161F',
          card: '#181E29',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: '#1F2735',
          text: '#F8FAFC',
          muted: '#94A3B8',
          success: '#10B981',
          warning: '#F59E0B',
          critical: '#EF4444',
        },
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
        glassHeavy: '24px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glassInset: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
        glowAmber: '0 0 25px rgba(255, 184, 0, 0.25)',
        glowEmerald: '0 0 25px rgba(16, 185, 129, 0.25)',
        glowCritical: '0 0 25px rgba(239, 68, 68, 0.25)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-fade': 'glowFade 2s ease-in-out infinite alternate',
        'float-subtle': 'floatSubtle 4s ease-in-out infinite',
      },
      keyframes: {
        glowFade: {
          '0%': { opacity: '0.4' },
          '100%': { opacity: '0.8' },
        },
        floatSubtle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
    },
  },
  plugins: [],
}
