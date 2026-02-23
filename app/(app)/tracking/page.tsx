'use client'

import { useState, useMemo } from 'react'
import {
    LineChart as LucideLineChart,
    TrendingUp,
    Plus,
    Calendar,
    Activity,
    Zap,
    ChevronRight,
    ChevronLeft,
    Loader2
} from 'lucide-react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts'
import { cn } from '@/lib/utils'
import { useTracking, useAuth } from '@/lib/supabase/hooks'

const LOGS = [
    { id: 1, type: 'ENTRENAMIENTO', name: 'Protocolo Hipertrofia D8', value: '75 min', kcal: '450 kcal', icon: Zap, color: 'text-nex-neon' },
    { id: 2, type: 'NUTRICION', name: 'Adherencia Macronutrientes', value: '98%', kcal: '2,850 kcal', icon: Activity, color: 'text-nex-purple' },
]

export default function TrackingPage() {
    const { user } = useAuth()
    const { biometrics, loading } = useTracking(user?.id)
    const [selectedDay, setSelectedDay] = useState('Dom')

    const chartData = useMemo(() => {
        const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
        return biometrics.map(b => ({
            name: days[new Date(b.logged_date).getUTCDay()],
            weight: b.value,
            kcal: 2800 // Temporary fallback for chart
        }))
    }, [biometrics])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-nex-purple animate-spin" />
                <p className="text-nex-muted font-black uppercase tracking-[0.3em] text-[10px]">Calculando Bio-Métricas...</p>
            </div>
        )
    }

    return (
        <div className="space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 rounded bg-nex-purple text-white text-[10px] font-bold uppercase tracking-widest">
                            Performance Analytics
                        </span>
                        <span className="text-[10px] text-nex-neon font-bold uppercase tracking-widest flex items-center gap-1">
                            Bio-Feedback Loop Optimized
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black font-rajdhani uppercase tracking-tighter italic">
                        BIO <span className="text-nex-purple">ANALYTICS</span>
                    </h1>
                    <p className="text-nex-muted mt-2 tracking-widest uppercase text-xs font-bold border-l-2 border-nex-purple pl-4">
                        Visualización de métricas y tracking de progreso sistémico.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-white/5 border border-white/10 p-3 rounded-2xl hover:bg-white/10 transition-all">
                        <Calendar className="w-5 h-5 text-nex-purple" />
                    </button>
                    <button className="bg-nex-purple text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest font-rajdhani text-lg hover:scale-105 transition-all shadow-purple-glow flex items-center gap-3">
                        <Plus className="w-5 h-5" /> Iniciar Log
                    </button>
                </div>
            </header>

            {/* Week Strip */}
            <div className="flex justify-between gap-4 overflow-x-auto pb-4">
                {chartData.map((day) => (
                    <div
                        key={day.name}
                        onClick={() => setSelectedDay(day.name)}
                        className={cn(
                            "flex-1 min-w-[100px] glass-card p-6 text-center cursor-pointer transition-all border-white/5",
                            selectedDay === day.name ? "border-nex-purple shadow-purple-glow scale-105 bg-nex-purple/10" : "hover:border-white/20"
                        )}
                    >
                        <span className="text-[10px] font-bold text-nex-muted uppercase tracking-[0.2em] block mb-2">{day.name}</span>
                        <span className="text-2xl font-black font-rajdhani italic text-nex-white">{day.weight}</span>
                        <span className="block text-[8px] text-nex-muted font-bold uppercase mt-1">KG</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Chart View */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-10 border-white/5 h-[450px]">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xs font-black text-nex-muted uppercase tracking-[0.3em] flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-nex-neon" /> Bio-Progress Curve
                            </h3>
                            <div className="flex gap-4 text-[9px] font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-nex-purple"></span> Peso Corp.</span>
                                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-nex-neon"></span> Kcal Consumidas</span>
                            </div>
                        </div>

                        <div className="w-full h-full pb-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7b2fff" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#7b2fff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b6b8a', fontSize: 10, fontWeight: 'bold' }}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                                        itemStyle={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="weight"
                                        stroke="#7b2fff"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorPurple)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Daily Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <h3 className="text-xs font-black text-nex-muted uppercase tracking-[0.3em] flex items-center gap-2">
                        <Activity className="w-4 h-4 text-nex-purple" /> Actividad {selectedDay}
                    </h3>

                    <div className="space-y-4">
                        {LOGS.map((log) => {
                            const Icon = log.icon
                            return (
                                <div key={log.id} className="glass-card p-6 border-white/5 group hover:border-white/20 transition-all flex items-center gap-6">
                                    <div className={cn("w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110", log.color)}>
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block text-[8px] text-nex-muted font-bold uppercase tracking-widest mb-1">{log.type}</span>
                                        <h4 className="text-sm font-black font-rajdhani uppercase text-nex-white italic">{log.name}</h4>
                                        <div className="mt-2 flex justify-between items-center">
                                            <span className="text-lg font-black font-rajdhani text-nex-white">{log.value}</span>
                                            <span className="text-[10px] font-bold text-nex-purple">{log.kcal}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        <div className="glass-card p-8 bg-nex-purple/10 border-nex-purple/20 text-center space-y-4">
                            <p className="text-[10px] font-bold text-nex-white uppercase tracking-widest">Tu Bio-Eficiencia hoy fue superior al 92%</p>
                            <button className="text-nex-neon text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto">
                                Ver Reporte Completo <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
