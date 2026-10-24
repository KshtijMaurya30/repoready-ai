/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090b18",
        panel: "#11152a",
        panelSoft: "#171c34",
        violet: "#8b7cff",
        cyan: "#65dbe7",
        lime: "#a6e98b",
      },
      boxShadow: {
        glow: "0 0 50px rgba(139, 124, 255, 0.16)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

