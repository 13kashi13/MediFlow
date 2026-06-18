/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: '#FFFFFF',
          secondary: '#EEEEEE',
          green: '#6FCF97',
          teal: '#2FA084',
          'dark-teal': '#1F6F5F',
        },
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
        },
        border: '#E5E7EB',
        success: '#6FCF97',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
