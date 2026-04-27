import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        jackfruit: {
          cream: "#fff7df",
          gold: "#f4b942",
          leaf: "#2f6f4e",
          deep: "#173b2d"
        }
      },
      boxShadow: {
        soft: "0 24px 60px rgba(23, 59, 45, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;