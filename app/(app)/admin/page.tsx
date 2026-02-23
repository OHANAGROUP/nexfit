import { BentoCard } from "@/components/ui/BentoCard";
import { Shield, Settings, Users, Database } from "lucide-react";

export default function AdminPage() {
    return (
        <div className="space-y-12">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded bg-nex-purple text-white text-[10px] font-bold uppercase tracking-widest">
                        System Admin
                    </span>
                </div>
                <h1 className="text-5xl font-black italic tracking-tighter">
                    BIO-CORE <span className="text-nex-purple">ADMIN</span>
                </h1>
                <p className="text-nex-muted mt-2 tracking-widest uppercase text-xs font-bold border-l-2 border-nex-neon pl-4">
                    Gestión sistémica de nodos, tenants y seguridad.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <BentoCard
                    title="Seguridad"
                    value="Enlace"
                    subtitle="RLS Activo"
                    icon={Shield}
                    color="purple"
                />
                <BentoCard
                    title="Tenants"
                    value="01"
                    subtitle="Activos"
                    icon={Users}
                    color="neon"
                />
                <BentoCard
                    title="Base de Datos"
                    value="Synced"
                    subtitle="Latencia: 12ms"
                    icon={Database}
                    color="lila"
                />
                <BentoCard
                    title="Configuración"
                    value="Core"
                    subtitle="v3.0.0"
                    icon={Settings}
                    color="purple"
                />
            </div>

            <div className="glass-card p-12 text-center border-dashed border-white/5 bg-nex-card/20">
                <p className="text-nex-muted uppercase tracking-[0.4em] text-[10px] font-bold">
                    [ ADMINISTRACIÓN DEL SISTEMA NEXFIT ]
                </p>
            </div>
        </div>
    );
}
