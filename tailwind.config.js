/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        surface: {
          DEFAULT: "#FFFFFF",
          card: "#FFFFFF",
          subtle: "#F1F5F9",
          hover: "#F8FAFC",
          mint: "#EEF7F4",
          blue: "#F1F7FF",
          amber: "#FFF9F0",
          border: "#E2E8F0",
        },
        brand: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#10B981", // primary emerald
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          teal: "#0D9488",
          dark: "#0F172A",
        },
        monad: {
          DEFAULT: "#6366F1",
          hover: "#4F46E5",
          light: "#EEF2FF",
          dark: "#312E81",
        },
        text: {
          primary: "#0F172A", // deep navy
          secondary: "#475569", // muted slate
          muted: "#64748B",
          light: "#94A3B8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        card: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)",
        elevated: "0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "flow-line": "flow 2s linear infinite",
      },
      keyframes: {
        flow: {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};
