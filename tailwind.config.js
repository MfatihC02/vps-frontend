/** @type {import('tailwindcss').Config} */
import { addDynamicIconSelectors } from '@iconify/tailwind'

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '300px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'primary': {
          DEFAULT: '#2F5E32',
          'light': '#4A8E4D',
          'dark': '#234726',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      }
    },
  },
  plugins: [
    addDynamicIconSelectors({
      prefix: 'icon',
      provider: 'fontisto'
    }),
  ],
}