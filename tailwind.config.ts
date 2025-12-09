import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';
import { PluginAPI } from 'tailwindcss/types/config';

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      'hsm': { 'raw': '(min-height: 500px)' },
      'hmd': { 'raw': '(min-height: 700px)' },
      'hlg': { 'raw': '(min-height: 900px)' },
    },
    extend: {
      colors: {
        border: "hsl(var(--border), <alpha-value>)",
        input: "hsl(var(--input), <alpha-value>)",
        ring: "hsl(var(--ring), <alpha-value>)",
        background: "hsl(var(--background), <alpha-value>)",
        foreground: "hsl(var(--foreground), <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary), <alpha-value>)",
          foreground: "hsl(var(--primary-foreground), <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary), <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground), <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive), <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground), <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted), <alpha-value>)",
          foreground: "hsl(var(--muted-foreground), <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent), <alpha-value>)",
          foreground: "hsl(var(--accent-foreground), <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover), <alpha-value>)",
          foreground: "var(--popover-foreground), <alpha-value>)",
        },
        code: {
          DEFAULT: "hsl(var(--code), <alpha-value>)",
          foreground: "var(--code-foreground), <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card), <alpha-value>)",
          foreground: "var(--card-foreground), <alpha-value>)",
        },
        success: {
          DEFAULT: "hsl(var(--success), <alpha-value>)",
          foreground: "hsl(var(--success-foreground), <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "marquee": {
          from: { transform: "translate(0%, 0)" },
          to: { transform: "translate(-25%, 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "marquee-slow": "marquee 20s linear infinite",
      },
      fontFamily: {
        groteskItalic: ['var(--font-HostGroteskItalic)']
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function ({ matchUtilities, theme }: PluginAPI) {
      matchUtilities(
        {
          'auto-fill': (value) => ({
            gridTemplateColumns: `repeat(auto-fill, minmax(min(${value}, 100%), 1fr))`,
          }),
          'auto-fit': (value) => ({
            gridTemplateColumns: `repeat(auto-fit, minmax(min(${value}, 100%), 1fr))`,
          })
        },
        {
          values: theme('width'),
        }
      );
    }),
    plugin(function ({ matchUtilities, theme }: PluginAPI) {
      matchUtilities(
        {
          'outline-border': (value) => ({
            'outline': `1px solid ${value}`,
          }),
        },
        {
          values: theme('colors'),
          type: 'color',
        }
      );
    })
  ],
} satisfies Config

export default config