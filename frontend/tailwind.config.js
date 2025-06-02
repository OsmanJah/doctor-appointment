/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,css}"],
  theme: {
    extend: {
      colors: {
        primaryColor: "#4FD1C5",
        primaryColorHover: "#41A79E",
        secondaryColor: "#FDF7E4",
        accentColor: "#D69E2E",
        lightTealBg: "#E6FFFA",
        
        buttonBgColor: "#4FD1C5",
        yellowColor: "#FEB60D",
        purpleColor: "#9771FF",
        
        headingColor: "#2D3748",
        textColor: "#4A5568",
      },

      boxShadow: {
        panelShadow: "rgba(17, 12, 46, 0.15) 0px 48px 100px 0px;",
      },
    },
  },
  plugins: [],
};
