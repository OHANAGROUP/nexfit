import { Sidebar } from "@/components/layout/Sidebar";
import { ResilienceBanner } from "@/components/ui/ResilienceBanner";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-nex-black text-nex-white">
            <Sidebar />
            <div className="flex-1 flex flex-col md:ml-64">
                <ResilienceBanner />
                <main className="flex-1 p-6 md:p-12 animate-in fade-in duration-700">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
