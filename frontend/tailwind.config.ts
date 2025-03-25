import tailwindAnimate from "tailwindcss-animate";
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        'chatgpt': {
          'primary': '#10A37F',
          'secondary': 'rgba(32,33,35,0.5)',
          'dark': {
            'start': '#1E2937',
            'mid': '#2A3640',
            'end': '#1E392A',
            'card': 'rgba(25,28,35,0.75)',
            'nav': 'rgba(25,28,35,0.85)',
          }
        },
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(160deg, #1E2937 0%, #2A3640 45%, #1E392A 100%)',
      },
    },
  },
  plugins: [tailwindAnimate],
};

export default config;
