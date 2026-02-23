'use client'
import { useState } from 'react'
import { usePeriodization } from '@/lib/supabase/periodization'
import {
    Calendar,
    Target,
    ChevronRight,
    Activity,
    Zap,
    ChevronLeft,
    Plus,
    BarChart3,
    Clock,
    Flame
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MesociclosPage() {
    const { mesocycles, phases, loading, activeMesocycle } = usePeriodization()
    const [selectedMeso, setSelectedMeso] = useState<string | null>(activeMesocycle?.id || null)

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Activity className="w-10 h-10 text-nex-purple animate-spin" />
        </div>
    )

    const currentMeso = mesocycles.find(m => m.id === selectedMeso) || activeMesocycle
    const currentWeek = 2 // Mock current week for display

    return (
        <div className="space-y-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 rounded bg-nex-purple text-white text-[10px] font-bold uppercase tracking-widest">Periodización Técnica</span>
                        <span className="text-[10px] text-nex-muted font-bold uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-nex-neon animate-pulse"></span> Sistema de Bloques Activo
                        </span>
                    </div>
                    <h1 className="text-5xl font-black font-rajdhani uppercase tracking-tighter italic">
                        MESO<span className="text-nex-neon">CYCLES</span>
                    </h1>
                    <p className="text-nex-muted mt-2 tracking-widest uppercase text-xs font-bold border-l-2 border-nex-purple pl-4">
                        Gestión de bloques de entrenamiento y picos de rendimiento.
                    </p>
                </div>
                <button className="bg-nex-white text-nex-black px-6 py-3 rounded-xl font-black uppercase tracking-widest font-rajdhani text-sm hover:bg-nex-neon transition-all flex items-center gap-2 shadow-xl group">
                    <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                    Nuevo Bloque
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Mesocycle List */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-nex-muted px-2">Bloques Recientes</h2>
                    {mesocycles.map(meso => (
                        <button
                            key={meso.id}
                            onClick={() => setSelectedMeso(meso.id)}
                            className={cn(
                                "w-full text-left p-5 rounded-2xl border transition-all glass-card",
                                selectedMeso === meso.id
                                    ? "border-nex-purple/50 bg-nex-purple/10"
                                    : "border-white/5 hover:border-white/20"
                            )}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <Target className={cn("w-5 h-5", selectedMeso === meso.id ? "text-nex-neon" : "text-nex-purple")} />
                                {meso.isActive && (
                                    <span className="px-1.5 py-0.5 rounded bg-nex-neon/20 text-nex-neon text-[8px] font-black uppercase border border-nex-neon/30">Activo</span>
                                )}
                            </div>
                            <div className="font-black italic tracking-tighter uppercase text-sm mb-1">{meso.name}</div>
                            <div className="text-[10px] text-nex-muted font-bold uppercase tracking-widest">
                                {new Date(meso.startDate).toLocaleDateString('es-CL')} — {new Date(meso.endDate).toLocaleDateString('es-CL')}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Mesocycle Detail / Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    {currentMeso ? (
                        <>
                            <div className="glass-card p-8 rounded-3xl border-nex-purple/10 relative overflow-hidden">
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-nex-purple/10 blur-[60px] rounded-full pointer-events-none" />

                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div>
                                        <h2 className="text-3xl font-black italic tracking-tighter font-rajdhani text-nex-white mb-2">{currentMeso.name}</h2>
                                        <p className="text-nex-muted text-sm max-w-md">{currentMeso.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-nex-purple uppercase tracking-widest mb-1">Objetivo Primario</div>
                                        <div className="text-nex-neon text-xl font-black italic font-tech uppercase">{currentMeso.goal}</div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="space-y-6 relative z-10">
                                    <div className="flex justify-between items-center px-2">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-nex-muted">Timeline Semanal</h3>
                                        <span className="text-[10px] font-black text-nex-neon uppercase">Semana {currentWeek} de {phases.length}</span>
                                    </div>

                                    <div className="grid grid-cols-4 gap-4">
                                        {phases.map(phase => {
                                            const isCurrent = phase.weekNumber === currentWeek
                                            const isPast = phase.weekNumber < currentWeek
                                            return (
                                                <div key={phase.id} className="space-y-3">
                                                    <div className={cn(
                                                        "h-2 rounded-full overflow-hidden transition-all",
                                                        isPast ? "bg-nex-purple" : isCurrent ? "bg-nex-neon" : "bg-white/5"
                                                    )} />
                                                    <div className={cn(
                                                        "p-4 rounded-xl border transition-all",
                                                        isCurrent ? "bg-nex-neon/5 border-nex-neon/30 scale-105 shadow-neon-glow" : "bg-white/5 border-white/5"
                                                    )}>
                                                        <div className="text-[9px] font-black uppercase text-nex-muted mb-1">Semana {phase.weekNumber}</div>
                                                        <div className={cn("text-[11px] font-black mb-2", isCurrent ? "text-nex-white" : "text-nex-muted")}>
                                                            {phase.name.toUpperCase()}
                                                        </div>
                                                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                                                            <div className="flex items-center gap-1.5">
                                                                <Flame className="w-3 h-3 text-orange-500" />
                                                                <span className="text-[9px] font-bold text-nex-white/60">{phase.intensityTarget}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <BarChart3 className="w-3 h-3 text-nex-purple" />
                                                                <span className="text-[9px] font-bold text-nex-white/60">{phase.volumeTarget}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Phase Detail Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="glass-card p-6 flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-nex-neon/10 border border-nex-neon/20">
                                        <Zap className="w-5 h-5 text-nex-neon" />
                                    </div>
                                    <div>
                                        <h4 className="font-black italic text-sm mb-1 uppercase tracking-tight">Focus de Intensidad</h4>
                                        <p className="text-nex-muted text-[11px] leading-relaxed">
                                            Mantener RPE {phases.find(p => p.weekNumber === currentWeek)?.intensityTarget || '7-8'} en movimientos básicos para asegurar la sobrecarga mecánica.
                                        </p>
                                    </div>
                                </div>
                                <div className="glass-card p-6 flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-nex-purple/10 border border-nex-purple/20">
                                        <Clock className="w-5 h-5 text-nex-purple" />
                                    </div>
                                    <div>
                                        <h4 className="font-black italic text-sm mb-1 uppercase tracking-tight">Meta de Recuperación</h4>
                                        <p className="text-nex-muted text-[11px] leading-relaxed">
                                            Priorizar sueño nocturno de +7.5h. El volumen acumulado está en el punto crítico antes del deload previsto.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="glass-card p-20 text-center border-dashed opacity-50">
                            <Target className="w-12 h-12 text-nex-muted mx-auto mb-4" />
                            <h3 className="text-xl font-black italic tracking-tighter">SIN MESOCICLO SELECCIONADO</h3>
                            <button className="mt-4 text-nex-purple font-black uppercase text-xs hover:text-nex-neon transition-colors">
                                Crear Primer Bloque →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
