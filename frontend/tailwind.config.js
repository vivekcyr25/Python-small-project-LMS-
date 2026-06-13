/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ios: {
          bg: '#080a14',
          surface: 'rgba(255, 255, 255, 0.04)',
          'surface-elevated': 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(255, 255, 255, 0.07)',
          text: '#e4e4ea',
          'text-secondary': 'rgba(255, 255, 255, 0.45)',
          accent: '#6b9fd4',
          'accent-deep': '#4a7ab0',
          green: '#5cb87a',
          purple: '#9b8ec4',
          orange: '#c9a06c',
          red: '#c47a7a',
        },
      },
      borderRadius: {
        ios: '22px',
        'ios-lg': '28px',
        'ios-xl': '36px',
      },
      fontFamily: {
        sf: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        ios: '40px',
        'ios-lg': '48px',
      },
      transitionTimingFunction: {
        ios: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ios-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      boxShadow: {
        'ios-glass': '0 0 0 0.5px rgba(255,255,255,0.04) inset, 0 12px 40px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.05) inset',
        'ios-glow': '0 2px 12px rgba(74, 122, 176, 0.15)',
      },
    },
  },
  plugins: [],
}
