import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#050505",
          secondary: "#0A0A0A",
        },
        gold: {
          DEFAULT: "#C5A880",
          light: "#E8D8C8",
          dark: "#8C7355",
          matte: "#B89778",
        },
        onyx: {
          DEFAULT: "#0C0C0C",
          elevated: "#141414",
          border: "#1C1C1C",
        },
        card: {
          DEFAULT: "#0C0C0C",
          hover: "#141414",
        },
        border: {
          DEFAULT: "#1C1C1C",
          gold: "rgba(197, 168, 128, 0.3)",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cinzel", "serif"],
        display: ["var(--font-display)", "Syne", "sans-serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        subtle: "0 10px 30px -10px rgba(0, 0, 0, 0.9)",
      },
    },
  },
  plugins: [],
};

export default config;
