/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        light: '#faf8f5',
        base: '#ffffff',
        // Text colors
        soft: '#3a3a3a',
        // Dark color for buttons/backgrounds and text
        dark: '#1a1a1a',
        // Accent color
        accent: '#dbb89c',
        // Border color
        borderLight: '#dbb89c',
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        // Desktop typography
        'h1-desktop': ['56px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'h2-desktop': ['40px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.02em' }],
        'h3-desktop': ['32px', { lineHeight: '1.25', fontWeight: '600', letterSpacing: '-0.02em' }],
        'body-desktop': ['20px', { lineHeight: '1.6' }],
        'button-desktop': ['18px', { fontWeight: '600' }],
        // Mobile typography
        'h1-mobile': ['36px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'h2-mobile': ['28px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.02em' }],
        'h3-mobile': ['28px', { lineHeight: '1.25', fontWeight: '600', letterSpacing: '-0.02em' }],
        'body-mobile': ['18px', { lineHeight: '1.6' }],
        'button-mobile': ['18px', { fontWeight: '600' }],
      },
      maxWidth: {
        content: '1300px',
      },
      spacing: {
        'section-desktop': '80px',
        'section-mobile': '48px',
      },
      letterSpacing: {
        tightest: '-0.02em',
        uppercase: '0.05em',
      },
      borderRadius: {
        button: '8px',
        'button-lg': '12px',
      },
    },
  },
  plugins: [],
}
