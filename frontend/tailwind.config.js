/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fintech: {
          dark: '#0B0F19',
          card: '#111827',
          cardBorder: '#1F2937',
          accent: '#3B82F6',
          brand: '#0C2340',
          razorpay: '#0C2340',
          razorBlue: '#3395FF',
          riskLow: '#10B981',
          riskMedium: '#F59E0B',
          riskHigh: '#F97316',
          riskCritical: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
