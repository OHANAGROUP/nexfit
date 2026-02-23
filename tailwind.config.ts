import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'nex-black': '#0a0a0f',
                'nex-dark': '#12121a',
                'nex-card': '#1a1a28',
                'nex-purple': '#7b2fff',
                'nex-lila': '#c084fc',
                'nex-neon': '#39ff14',
                'nex-white': '#f0f0ff',
                'nex-muted': '#6b6b8a',
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            fontFamily: {
                rajdhani: ["var(--font-rajdhani)"],
                exo2: ["var(--font-exo2)"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            boxShadow: {
                'neon-glow': '0 0 15px rgba(57, 255, 20, 0.4)',
                'purple-glow': '0 0 20px rgba(123, 47, 255, 0.3)',
            }
        },
    },
    plugins: [],
};
export default config;
