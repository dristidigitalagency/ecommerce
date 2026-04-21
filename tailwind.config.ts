import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Himalayan Threads Primary Colors
        mountain: {
          50: '#FDF8F3',
          100: '#FAF1E6',
          200: '#F5E3CD',
          300: '#EDD5B4',
          400: '#E0C192',
          500: '#D4AD70', // Primary warm gold
          600: '#B8860B', // Primary goldenrod
          700: '#8B6914',
          800: '#5F4A0E',
          900: '#3F3009',
        },
        earth: {
          50: '#FAF6F1',
          100: '#F4EBE3',
          200: '#E8D7C7',
          300: '#DBC3AB',
          400: '#C8A872',
          500: '#A0845C', // Warm brown
          600: '#8B4513', // Saddle brown
          700: '#6D3410',
          800: '#4F250C',
          900: '#351608',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        mountain: '0 10px 25px -5px rgba(184, 134, 11, 0.1)',
        'mountain-lg': '0 20px 40px -10px rgba(184, 134, 11, 0.15)',
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in',
        slideUp: 'slideUp 0.3s ease-out',
        scaleIn: 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};

export default config;
