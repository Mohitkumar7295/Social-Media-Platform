/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#FFFFFF',
          card: '#FFFFFF',
          subtle: '#F8FAF9',
          border: '#E8EAE8',
        },
        teal: {
          50: '#F0FAF8',
          100: '#E9F8F5',
          200: '#C7EFE8',
          300: '#8CD8CC',
          500: '#0F8178',
          600: '#086B64',
          700: '#075A54',
          800: '#064B46',
          900: '#043632',
          primary: '#0F8178',
          dark: '#086B64',
          mint: '#E9F8F5',
          pale: '#F0FAF8',
        },
        ink: {
          primary: '#201F1D',
          secondary: '#777777',
          muted: '#999999',
          light: '#CCCCCC',
        },
        brand: {
          50: '#F0FAF8',
          100: '#E9F8F5',
          200: '#C7EFE8',
          500: '#0F8178',
          600: '#086B64',
          700: '#0F8178', // primary accent
          800: '#086B64',
          900: '#043632',
        },
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
