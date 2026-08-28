/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Apple-सारखे रंग
        'ios-bg': '#F5F5F7',
        'ios-secondary': '#E5E5EA',
        'ios-text': '#1C1C1E',
        'ios-gray': '#8E8E93',
        'ios-blue': '#0A84FF',
        'ios-green': '#34C759',
        'ios-red': '#FF3B30',
      },
      fontFamily: {
        // Apple San Francisco Pro फॉन्ट स्टाइल
        'sf-pro': ['-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Helvetica Neue', 'sans-serif'],
      },
      borderRadius: {
        // iOS मध्ये वापरलेले Rounded corners
        '2xl': '20px',
        '3xl': '30px',
      },
      spacing: {
        'safe-top': 'max(1rem, env(safe-area-inset-top))',
        'safe-bottom': 'max(1rem, env(safe-area-inset-bottom))',
      },
      boxShadow: {
        // iOS डिझाइनचे Elevation
        'ios-sm': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'ios-md': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'ios-lg': '0 12px 24px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
