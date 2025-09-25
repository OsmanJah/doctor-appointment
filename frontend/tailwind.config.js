/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,css}"],
  theme: {
    extend: {
      colors: {
        // Brand palette tuned for healthcare: calm, trustworthy, modern
        primaryColor: "#14b8a6", // teal-500
        primaryColorHover: "#0d9488", // teal-600
        secondaryColor: "#f5f7fb", // soft mist background
        accentColor: "#7c3aed", // violet-600 for accents
        lightTealBg: "#e6fffb", // very light teal tint

  buttonBgColor: "#14b8a6", // use calm teal for primary CTAs
        yellowColor: "#fbbf24", // amber-400
        purpleColor: "#8b5cf6", // violet-500

        headingColor: "#0f172a", // slate-900
        textColor: "#334155", // slate-600
      },

      boxShadow: {
        panelShadow: "rgba(15, 23, 42, 0.08) 0px 20px 40px 0px",
        glowSoft: "0 10px 30px -5px rgba(14,165,233,0.25)",
      },

      backgroundImage: {
        'brand-hero': "radial-gradient(1200px 600px at 0% -10%, rgba(20,184,166,0.12), transparent 60%), radial-gradient(1000px 500px at 100% 0%, rgba(14,165,233,0.10), transparent 60%), linear-gradient(180deg, #f9fbff 0%, #ffffff 100%)",
        // Softer diagonal gradient (sky-300 -> teal-400 -> violet-400)
        'brand-diagonal': "linear-gradient(135deg, #7dd3fc 0%, #2dd4bf 50%, #a78bfa 100%)",
        // Extra-soft diagonal for headings/brand when a calmer look is needed
        'brand-diagonal-soft': "linear-gradient(135deg, #bae6fd 0%, #99f6e4 50%, #d8b4fe 100%)",
        // Stronger contrast gradient for headings (better readability)
        'brand-diagonal-strong': "linear-gradient(135deg, #38bdf8 0%, #14b8a6 50%, #8b5cf6 100%)",
      },

      keyframes: {
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'gradient-x': 'gradient-x 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
