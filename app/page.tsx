import Link from "next/link";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-nex-black">
            <div className="glass-card p-12 text-center animate-pulse">
                <h1 className="text-6xl font-black italic mb-4">
                    NEX<span className="text-nex-neon">FIT</span>
                </h1>
                <p className="text-nex-muted uppercase tracking-[0.3em] text-xs font-bold">
                    Sincronizando Núcleo de Alto Rendimiento...
                </p>
                <div className="mt-8 flex gap-6 justify-center">
                    <Link href="/login" className="text-nex-purple font-black uppercase text-xs tracking-widest hover:text-white transition-all">Link Start</Link>
                    <Link href="/dashboard" className="text-nex-neon font-black uppercase text-xs tracking-widest hover:text-white transition-all">Access Dashboard</Link>
                </div>
            </div>
        </main>
    );
}
