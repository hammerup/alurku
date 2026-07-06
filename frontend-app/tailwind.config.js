/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "glass-bg": "rgba(243, 244, 246, 0.4)", // light semi-transparent gray to support backdrop-blur on light mode
        "brand-yellow": "#FACC15",
        "brand-navy": "#111E38",
        "calm-gray": "#F3F4F6",
      },
      fontFamily: {
        geist: ["Geist", "Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        "2xl": "2rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionTimingFunction: {
        "custom": "cubic-bezier(0.32,0.72,0,1)",
      },
    },
  },
  plugins: [],
};