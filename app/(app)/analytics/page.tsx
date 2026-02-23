'use client'
import {
    BarChart2, TrendingUp, Users, Zap, Activity, Loader2
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { cn } from '@/lib/utils'
import { useAnalytics } from '@/lib/supabase/hooks'

function StatCard({ label, value, sub, color = 'purple' }: { label: string; value: string | number; sub?: string; color?: string }) {
    return (
        <div className={cn("glass-card p-6 relative overflow-hidden group hover:scale-[1.02] transition-all")}>
            <div className={cn(
                "absolute -right-3 -top-3 w-16 h-16 blur-[40px] opacity-15 pointer-events-none group-hover:opacity-30 transition-opacity",
                color === 'neon' ? 'bg-nex-neon' : color === 'lila' ? 'bg-nex-lila' : 'bg-nex-purple'
            )} />
            <div className="text-[10px] font-bold text-nex-muted uppercase tracking-[0.2em] mb-1">{label}</div>
            <div className="text-4xl font-black italic font-rajdhani tracking-tighter text-nex-white">{value}</div>
            {sub && <div className="text-[10px] text-nex-muted font-bold uppercase tracking-widest mt-1">{sub}</div>}
        </div>
    )
}

const TOOLTIP_STYLE = {
    backgroundColor: '#0a0a0f',
    border: '1px solid rgba(123,47,255,0.3)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '12px',
}

export default function AnalyticsPage() {
    const { analytics, loading, isMock } = useAnalytics()

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-nex-purple animate-spin" />
        </div>
    )

    const { adherence_trend, athlete_leaderboard, bmi_trend, summary } = analytics

    return (
        <div className="space-y-10">
            {/* Header */}
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded bg-nex-purple text-white text-[10px] font-bold uppercase tracking-widest">Analytics Engine</span>
                    {isMock && <span className="px-2 py-0.5 rounded bg-nex-neon/20 border border-nex-neon/30 text-nex-neon text-[10px] font-bold uppercase tracking-widest">Demo Mode</span>}
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter font-rajdhani">
                    ANALY<span className="text-nex-neon">TICS</span>
                </h1>
                <p className="text-nex-muted text-sm mt-1">Rendimiento agregado del equipo — Últimas 4 semanas</p>
            </header>

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Adherencia Media" value={`${summary.adherence_avg}%`} sub="Target > 90%" color="purple" />
                <StatCard label="Sesiones Completadas" value={summary.sessions_done} sub="Mes en curso" color="neon" />
                <StatCard label="Racha Máxima" value={`${summary.streak_max}d`} sub="Consecutivos" color="lila" />
                <StatCard label="Alertas Activas" value={summary.alerts_pending} sub="Requieren atención" color="purple" />
            </div>

            {/* Adherence Trend Chart */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-nex-purple" />
                    <h2 className="font-black italic tracking-tighter text-lg">TENDENCIA DE ADHERENCIA</h2>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={adherence_trend}>
                        <defs>
                            <linearGradient id="gradDone" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7b2fff" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#7b2fff" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradPlanned" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00f5a0" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#00f5a0" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="week" stroke="#555" tick={{ fill: '#666', fontSize: 11 }} />
                        <YAxis stroke="#555" tick={{ fill: '#666', fontSize: 11 }} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Area type="monotone" dataKey="planned" stroke="#00f5a0" strokeWidth={1.5} fill="url(#gradPlanned)" name="Planificadas" />
                        <Area type="monotone" dataKey="done" stroke="#7b2fff" strokeWidth={2} fill="url(#gradDone)" name="Completadas" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leaderboard */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <Users className="w-5 h-5 text-nex-neon" />
                        <h2 className="font-black italic tracking-tighter text-lg">RANKING ATLETAS</h2>
                    </div>
                    <div className="space-y-3">
                        {athlete_leaderboard.map((a: any, i: number) => (
                            <div key={a.name || a.user_id} className="flex items-center gap-3">
                                <div className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-black italic",
                                    i === 0 ? 'bg-nex-neon/20 text-nex-neon border border-nex-neon/30' :
                                        i === 1 ? 'bg-nex-purple/20 text-nex-purple border border-nex-purple/30' :
                                            'bg-white/5 text-nex-muted border border-white/10'
                                )}>
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-sm">{a.name || a.full_name}</span>
                                        <div className="flex items-center gap-2">
                                            {(a.streak || 0) > 0 && (
                                                <span className="text-[10px] font-bold text-orange-400 flex items-center gap-0.5">
                                                    🔥{a.streak}d
                                                </span>
                                            )}
                                            <span className="text-[11px] font-black text-nex-neon">{a.adherence_pct}%</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all",
                                                (a.adherence_pct || 0) >= 90 ? 'bg-nex-neon' :
                                                    (a.adherence_pct || 0) >= 75 ? 'bg-nex-purple' : 'bg-orange-500'
                                            )}
                                            style={{ width: `${a.adherence_pct || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* BMI Trend */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <TrendingUp className="w-5 h-5 text-nex-lila" />
                        <h2 className="font-black italic tracking-tighter text-lg">TENDENCIA IMC</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={bmi_trend}>
                            <defs>
                                <linearGradient id="gradBmi" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" stroke="#555" tick={{ fill: '#666', fontSize: 10 }} />
                            <YAxis stroke="#555" tick={{ fill: '#666', fontSize: 10 }} domain={['auto', 'auto']} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                            <Area type="monotone" dataKey="bmi" stroke="#a855f7" strokeWidth={2} fill="url(#gradBmi)" name="IMC" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Weekly sessions bar */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                    <BarChart2 className="w-5 h-5 text-nex-purple" />
                    <h2 className="font-black italic tracking-tighter text-lg">SESIONES POR SEMANA</h2>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={adherence_trend} barSize={28}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="week" stroke="#555" tick={{ fill: '#666', fontSize: 11 }} />
                        <YAxis stroke="#555" tick={{ fill: '#666', fontSize: 11 }} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Bar dataKey="planned" fill="rgba(123,47,255,0.2)" radius={[4, 4, 0, 0]} name="Planificadas" />
                        <Bar dataKey="done" fill="#7b2fff" radius={[4, 4, 0, 0]} name="Completadas" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
