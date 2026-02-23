import type { Metadata } from "next";
import { Rajdhani, Exo_2 } from "next/font/google";
import "./globals.css";
import "./assistant.css";
import { MaviCoach } from "@/components/layout/MaviCoach";

const rajdhani = Rajdhani({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-rajdhani",
});

const exo2 = Exo_2({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-exo2",
});

export const metadata: Metadata = {
    title: "NEXFIT - Multitenant Fitness System",
    description: "Advanced fitness management for high-performance gyms.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" className={`${rajdhani.variable} ${exo2.variable}`}>
            <body className="antialiased font-exo2">
                {children}
                <MaviCoach />
            </body>
        </html>
    );
}
