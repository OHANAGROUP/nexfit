export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-nex-black flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-nex-purple opacity-10 blur-[120px]" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-nex-neon opacity-5 blur-[120px]" />
            </div>

            <div className="w-full max-w-md animate-in zoom-in fade-in duration-500">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-black italic tracking-tighter mb-2">
                        NEX<span className="text-nex-neon">FIT</span>
                    </h1>
                    <p className="text-nex-muted uppercase tracking-[0.4em] text-[10px] font-bold">
                        Bio-Core Performance System
                    </p>
                </div>
                {children}
            </div>
        </div>
    );
}
