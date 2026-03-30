import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dk: "#2A0E00",
        dk2: "#3D1600",
        dk3: "#521F00",

        gold: "#C8A84B",
        gold2: "#E2C06A",

        ivory: "#FCF7EE",
        textPrimary: "#2A1400",

        red: "#A82020",
        green: "#1A6A40",
      },
      fontFamily: {
        sans: ["Nunito Sans", "sans-serif"],
        serif: ["Fraunces", "serif"],
      },
    },
  },
} satisfies Config;