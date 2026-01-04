/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        light: '#faf8f5',
        base: '#ffffff',
        dark: '#1a1a1a',
        soft: '#3a3a3a',
        accent: '#dbb89c',
        'border-light': '#e4dfda',
        bg: {
          light: "#faf8f5",
          base: "#ffffff"
        },
        text: {
          dark: "#1a1a1a",
          soft: "#3a3a3a"
        },
        accent: "#dbb89c",
        border: {
          light: "#e4dfda"
        },
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        primary: ["Manrope", "sans-serif"],    // headings
        secondary: ["Inter", "sans-serif"],    // body
        tertiary: ["Poppins", "sans-serif"],    // hero, subheadings, short text
        accent: ["Poppins", "sans-serif"],    // buttons, labels, small text
        poppins: ["Poppins", "sans-serif"],    // hero, subheadings, short text
      },
      fontSize: {
        h1: ["56px", { lineHeight: "1.1" }],
        h2: ["40px", { lineHeight: "1.2" }],
        h3: ["32px", { lineHeight: "1.25" }],
        body: ["20px", { lineHeight: "1.6" }],
        button: ["18px", { lineHeight: "1.4" }],
        'h1-desktop': ['56px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h1-mobile': ['36px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h2-desktop': ['40px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'h2-mobile': ['28px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'h3-desktop': ['32px', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        'h3-mobile': ['28px', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        'body-desktop': ['20px', { lineHeight: '1.6' }],
        'body-mobile': ['18px', { lineHeight: '1.6' }],
        'button-desktop': ['18px'],
        'button-mobile': ['16px'],
      },
      maxWidth: {
        content: '1300px',
      },
      spacing: {
        'section-desktop': '80px',
        'section-mobile': '48px',
      },
      letterSpacing: {
        tightest: "-0.02em"
      },
      borderRadius: {
        button: '8px',
        xl: "12px",
      },
    },
  },
  plugins: [],
}
