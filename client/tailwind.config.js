/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          primary: '#0EB0E3',
          secondary: '#3946AE',
          background: '#FFFFFF',
          text: '#1A1A1A',
          surface: '#E8EDF5',
          border: '#E0E0E0',
        },
        dark: {
          primary: '#0EB0E3',
          secondary: '#3946AE',
          background: '#121212',
          text: '#ffffff',
          surface: '#1E1E1E',
          border: '#2D2D2D',
        },
      },
      animation: {
        fadeIn: 'fadeIn 1.5s ease-in',
        slideUp: 'slideUp 0.6s ease-out',
        slideIn: 'slideIn 1s ease-out',
        slideOut: 'slideOut 1s ease-in',
        slideInLeft: 'slideInLeft 1s ease-out',
        slideOutLeft: 'slideOutLeft 1s ease-in',
        loader:
          'fadeIn 0.3s ease-in, spin 3s linear infinite, scale 0.3s ease-in',
        loaderAlt: 'fade-in-scale-spin 2s ease-in-out infinite',
      },
      keyframes: {
        'fade-in-scale-spin': {
          '0%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%': { opacity: '0.5', transform: 'scale(0.5) rotate(180deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(360deg)' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scale: {
          '0%': { transform: 'scale(0)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOutLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
