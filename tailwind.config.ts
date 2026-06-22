import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#172018",
        field: "#f6f7f4",
        line: "#dde4d7",
        pine: "#2f5d4c",
        mint: "#dff1e7",
        amber: "#f4b942",
        coral: "#e56b5f",
        steel: "#476176"
      },
      boxShadow: {
        soft: "0 14px 45px rgba(23, 32, 24, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
