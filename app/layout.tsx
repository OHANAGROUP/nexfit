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
    title: "NEXFIT - Bio-Core System",
    description: "Advanced fitness management for high-performance gyms.",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "NEXFIT",
    },
};

export const viewport = {
    themeColor: "#0a0a0f",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', function() {
                                    navigator.serviceWorker.register('/sw.js');
                                });
                            }
                        `,
                    }}
                />
            </body>
        </html>
    );
}
