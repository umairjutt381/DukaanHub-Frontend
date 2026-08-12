import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#edf8f0",
          100: "#d8f0de",
          200: "#b2dfbd",
          300: "#7cc78d",
          400: "#43aa5e",
          500: "#168f40",
          600: "#0b8f3a",
          700: "#06702c",
          800: "#085823",
          900: "#07491f"
        },
        slate: {
          50: "#f8faf8",
          100: "#f2f5f2",
          200: "#e7ebe7",
          300: "#d2d8d3",
          400: "#959e97",
          500: "#667068",
          600: "#4c554e",
          700: "#353b36",
          800: "#202421",
          900: "#111411",
          950: "#0a0c0a"
        },
        charcoal: "#0a0c0a",
        surface: "#f5f7f5",
        cream: "#ffffff"
      },
      boxShadow: {
        premium: "0 28px 80px rgba(10, 12, 10, 0.15)",
        soft: "0 12px 36px rgba(10, 12, 10, 0.08)",
        hairline: "0 0 0 1px rgba(10, 12, 10, 0.06)"
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
        panel: "1.25rem"
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial", "sans-serif"],
        sans: ["var(--font-sans)", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
