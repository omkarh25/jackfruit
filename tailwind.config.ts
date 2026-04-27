import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        tattvam: {
          // Primary Purple Palette (Matte)
          purple: {
            50: "#F8F5FC",
            100: "#EDE8F5",
            200: "#D4C7E8",
            300: "#B49FDA",
            400: "#9578C9",
            500: "#7B5BB5",
            600: "#5B3E8C",
            700: "#4A3270",
            800: "#3A2554",
            900: "#2A1938",
            950: "#1A1423"
          },
          // Gold Accent Palette
          gold: {
            50: "#FDFBF5",
            100: "#F9F0DA",
            200: "#F5E6C8",
            300: "#E8D4A3",
            400: "#D4AF37",
            500: "#C4941F",
            600: "#A67A15",
            700: "#8A6210",
            800: "#6F4D0D",
            900: "#5A400A"
          },
          // Neutrals
          neutral: {
            50: "#FAF8F5",
            100: "#F0EDE8",
            200: "#E2DDD5",
            300: "#D1C9BE",
            400: "#B8AE9E",
            500: "#9A8E7E",
            600: "#7A7065",
            700: "#5A5248",
            800: "#3A342C",
            900: "#1A1423"
          }
        }
      },
      boxShadow: {
        soft: "0 24px 60px rgba(90, 62, 140, 0.08)",
        medium: "0 32px 80px rgba(90, 62, 140, 0.12)",
        glow: "0 0 60px rgba(212, 175, 55, 0.15)"
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "aurora-gradient": "linear-gradient(135deg, rgba(91, 62, 140, 0.05) 0%, rgba(212, 175, 55, 0.05) 50%, rgba(91, 62, 140, 0.05) 100%)"
      },
      animation: {
        "float-slow": "float 8s ease-in-out infinite",
        "float-medium": "float 6s ease-in-out infinite",
        "float-fast": "float 4s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "fade-in": "fadeIn 1s ease-out forwards",
        "slide-in-left": "slideInLeft 0.8s ease-out forwards",
        "slide-in-right": "slideInRight 0.8s ease-out forwards",
        "scale-in": "scaleIn 0.6s ease-out forwards",
        "shimmer": "shimmer 2s linear infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(3deg)" }
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-60px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(60px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
