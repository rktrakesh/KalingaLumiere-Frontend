/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fffaf0",
          100: "#fef0cf",
          200: "#fce09f",
          300: "#f8ca64",
          400: "#edb63e",
          500: "#dca62f",
          600: "#b9821f",
          700: "#93621b",
          800: "#784e1c",
          900: "#643f1c",
          950: "#3a210c",
        },
        // Kalinga Lumière brand landing page — premium luxury palette.
        luxury: {
          ink: "#070707",
          charcoal: "#111111",
          gold: "#D4AF37",
          goldLight: "#FFD76A",
          text: "#FFFFFF",
          muted: "#CFCFCF",
          success: "#22C55E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        card: "0 1px 0 rgba(255,255,255,0.025)",
        elevated: "0 16px 40px -20px rgba(0,0,0,0.72)",
      },
    },
  },
  plugins: [],
};
