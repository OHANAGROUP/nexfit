'use client'
import { BentoCard } from "@/components/ui/BentoCard";
import {
    useAuth, useAthletes, useAnalytics, useNotifications
} from "@/lib/supabase/hooks";
import {
    Users, Dumbbell, Activity, TrendingUp, Bell, Zap,
    ArrowRight, AlertTriangle, Trophy, BarChart2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SEVERITY_ICON: Record<string, any> = {
    warning: AlertTriangle,
    success: Trophy,
    info: BarChart2,
}
const SEVERITY_COLOR: Record<string, string> = {
    warning: 'text-orange-400',
    success: 'text-nex-neon',
    info: 'text-nex-purple',
}

function timeAgo(dateStr: string) {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000 / 60
    if (diff < 60) return `${Math.floor(diff)}m`
    if (diff < 1440) return `${Math.floor(diff / 60)}h`
    return `${Math.floor(diff / 1440)}d`
}

export default function DashboardPage() {
    const { user } = useAuth();
    const { athletes, loading: loadingAthletes } = useAthletes();
    const { analytics, loading: loadingAnalytics } = useAnalytics();
    const { notifications, unreadCount } = useNotifications();

    const adherence = analytics?.summary?.adherence_avg ?? '—';
    const streak = analytics?.summary?.streak_max ?? '—';
    const alerts = analytics?.summary?.alerts_pending ?? unreadCount;
    const topAlerts = notifications.filter((n: any) => !n.is_read).slice(0, 3);

    return (
        <div className="space-y-12">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded bg-nex-neon text-black text-[10px] font-bold uppercase tracking-widest">
                        Bio-Sync Active
                    </span>
                    <span className="text-[10px] text-nex-muted font-bold uppercase tracking-widest">
                        Tenant: Mavi High Performance
                    </span>
                </div>
                <h1 className="text-5xl font-black italic tracking-tighter">
                    CENTRAL <span className="text-nex-neon">DASHBOARD</span>
                </h1>
                {user?.user_metadata?.full_name && (
                    <div className="text-[10px] text-nex-neon font-black uppercase tracking-[0.3em] mt-1">
                        UNIT: {user.user_metadata.full_name}
                    </div>
                )}
                <p className="text-nex-muted mt-2 tracking-widest uppercase text-xs font-bold border-l-2 border-nex-purple pl-4">
                    Monitoreo en tiempo real de unidades y protocolos.
                </p>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <BentoCard
                    title="Atletas Activos"
                    value={loadingAthletes ? "..." : athletes.length.toString()}
                    subtitle="+12% vs mes anterior"
                    icon={Users}
                    color="purple"
                />
                <BentoCard
                    title="Adherencia Media"
                    value={loadingAnalytics ? "..." : `${adherence}%`}
                    subtitle="Target: >90%"
                    icon={Activity}
                    color="neon"
                />
                <BentoCard
                    title="Racha Máxima"
                    value={loadingAnalytics ? "..." : `${streak}d`}
                    subtitle="Consecutive sessions"
                    icon={Zap}
                    color="lila"
                />
                <BentoCard
                    title="Alertas Activas"
                    value={loadingAnalytics ? "..." : alerts.toString()}
                    subtitle="Requieren atención"
                    icon={Bell}
                    color="purple"
                />
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/analytics" className="glass-card p-5 flex items-center justify-between group hover:border-nex-purple/40 hover:shadow-purple-glow transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-nex-purple/10 border border-nex-purple/20 flex items-center justify-center">
                            <BarChart2 className="w-5 h-5 text-nex-purple" />
                        </div>
                        <div>
                            <div className="font-black italic tracking-tighter">ANALYTICS</div>
                            <div className="text-[10px] text-nex-muted uppercase tracking-widest font-bold">Tendencias y leaderboard</div>
                        </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-nex-muted group-hover:text-nex-purple group-hover:translate-x-1 transition-all" />
                </Link>

                <Link href="/notificaciones" className="glass-card p-5 flex items-center justify-between group hover:border-nex-neon/40 hover:shadow-neon-glow transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-nex-neon/10 border border-nex-neon/20 flex items-center justify-center relative">
                            <Bell className="w-5 h-5 text-nex-neon" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-black flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div>
                            <div className="font-black italic tracking-tighter">ALERTAS</div>
                            <div className="text-[10px] text-nex-muted uppercase tracking-widest font-bold">{unreadCount} sin leer</div>
                        </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-nex-muted group-hover:text-nex-neon group-hover:translate-x-1 transition-all" />
                </Link>
            </div>

            {/* Recent Alerts mini-feed */}
            {topAlerts.length > 0 && (
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-black italic tracking-tighter">ALERTAS RECIENTES</h2>
                        <Link href="/notificaciones" className="text-[10px] font-bold text-nex-purple uppercase tracking-widest hover:text-nex-neon transition-colors flex items-center gap-1">
                            Ver todas <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {topAlerts.map((n: any) => {
                            const Icon = SEVERITY_ICON[n.severity] || Bell
                            return (
                                <div key={n.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5">
                                    <Icon className={cn("w-4 h-4 shrink-0", SEVERITY_COLOR[n.severity])} />
                                    <div className="flex-1 min-w-0">
                                        <span className="font-bold text-sm text-nex-white truncate block">{n.title}</span>
                                        <span className="text-nex-muted text-[11px] truncate block">{n.message}</span>
                                    </div>
                                    <span className="text-[10px] text-nex-muted font-bold shrink-0">{timeAgo(n.created_at)}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Status strip */}
            <div className="glass-card p-8 border-nex-neon/20 bg-nex-neon/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-nex-neon/20">
                        <TrendingUp className="w-6 h-6 text-nex-neon" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold italic tracking-tight">BIO-DATA STREAMING ACTIVE</h3>
                        <p className="text-nex-muted text-xs tracking-wider font-medium">
                            Conexión establecida con el nodo central. Analytics en tiempo real habilitados.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
