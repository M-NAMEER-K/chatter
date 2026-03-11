import type { Config } from "tailwindcss"

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: "320px",     // Mobile
      sm: "375px",     // Large Mobile
      md: "768px",     // Tablet
      lg: "1024px",    // Small Laptop
      xl: "1280px",    // Laptop
      "2xl": "1440px", // Desktop
      "3xl": "1920px", // Large Desktop
    },
    extend: {},
  },
  plugins: [],
} satisfies Config