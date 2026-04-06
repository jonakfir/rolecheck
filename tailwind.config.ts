import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FDFAF5',
        slate: {
          deep: '#1A1F2E',
          medium: '#2D3348',
          light: '#4A5068',
        },
        coral: {
          DEFAULT: '#FF4F4F',
          light: '#FF7A7A',
          dark: '#E63E3E',
          bg: 'rgba(255, 79, 79, 0.08)',
        },
        mint: {
          DEFAULT: '#00C896',
          light: '#33D4AB',
          dark: '#00A67C',
          bg: 'rgba(0, 200, 150, 0.08)',
        },
        amber: {
          score: '#FFB347',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['1.75rem', { lineHeight: '1.25' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(26, 31, 46, 0.04), 0 4px 12px rgba(26, 31, 46, 0.06)',
        'card-hover': '0 2px 8px rgba(26, 31, 46, 0.06), 0 8px 24px rgba(26, 31, 46, 0.10)',
        'elevated': '0 4px 16px rgba(26, 31, 46, 0.08), 0 12px 40px rgba(26, 31, 46, 0.12)',
        'glow-coral': '0 0 20px rgba(255, 79, 79, 0.3)',
        'glow-mint': '0 0 20px rgba(0, 200, 150, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out both',
        'slide-up': 'slideUp 0.6s ease-out both',
        'score-fill': 'scoreFill 1.5s ease-out both',
        'shake': 'shake 0.5s ease-in-out',
        'word-appear': 'wordAppear 0.3s ease-out both',
        'float-up': 'floatUp 3s ease-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scoreFill: {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--score-offset)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        wordAppear: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatUp: {
          '0%': { opacity: '0.7', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-100px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
