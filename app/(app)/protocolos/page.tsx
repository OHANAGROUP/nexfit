'use client'

import { useState, useEffect } from 'react'
import {
    Dumbbell,
    ChevronLeft,
    Activity,
    CheckCircle2,
    Lock,
    Zap,
    Loader2
} from 'lucide-react'
import { MuscleMapDisplay } from '@/components/exercises/MuscleMapDisplay'
import { cn } from '@/lib/utils'
import { useRoutine, useAuth } from '@/lib/supabase/hooks'

export default function ProtocolosPage() {
    const { user } = useAuth()
    const { routine, loading } = useRoutine(user?.id)
    const [exercises, setExercises] = useState<any[]>([])
    const [selectedExercise, setSelectedExercise] = useState<any>(null)

    useEffect(() => {
        if (routine && routine.length > 0) {
            setExercises(routine)
            setSelectedExercise(routine[0])
        }
    }, [routine])

    const toggleComplete = (id: string) => {
        setExercises(prev => prev.map(ex =>
            ex.id === id ? { ...ex, completed: !ex.completed } : ex
        ))
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-nex-purple animate-spin" />
                <p className="text-nex-muted font-black uppercase tracking-[0.3em] text-[10px]">Cargando Bio-Protocolo...</p>
            </div>
        )
    }

    if (!selectedExercise) return null

    return (
        <div className="space-y-12">
            {/* Header Bio-Sync */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 rounded bg-nex-purple text-white text-[10px] font-bold uppercase tracking-widest">
                            Athlete Protocol
                        </span>
                        <span className="text-[10px] text-nex-neon font-bold uppercase tracking-widest flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Bio-Sync Active: {user?.user_metadata?.full_name || 'ATHLETE UNIT'}
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black font-rajdhani uppercase tracking-tighter italic">
                        NEO <span className="text-nex-purple">PROTOCOLS</span>
                    </h1>
                    <div className="flex gap-4 mt-4">
                        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                            <span className="block text-[8px] text-nex-muted font-bold uppercase">Estado Fase</span>
                            <span className="text-sm font-black font-rajdhani italic text-nex-white">FASE 1: ADAPTACION</span>
                        </div>
                        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                            <span className="block text-[8px] text-nex-muted font-bold uppercase">Progreso</span>
                            <span className="text-sm font-black font-rajdhani italic text-nex-neon">SEMANA 1</span>
                        </div>
                    </div>
                </div>
                <button className="text-nex-muted hover:text-nex-white flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest transition-all">
                    <ChevronLeft className="w-4 h-4" /> Volver al Directorio
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Interactive Exercise List */}
                <div className="lg:col-span-1 space-y-6">
                    <h3 className="text-xs font-black text-nex-muted uppercase tracking-[0.3em] flex items-center gap-2">
                        <Activity className="w-4 h-4 text-nex-purple" /> Stack de Entrenamiento
                    </h3>

                    <div className="space-y-4">
                        {exercises.map((ex) => (
                            <div
                                key={ex.id}
                                onClick={() => setSelectedExercise(ex)}
                                className={cn(
                                    "glass-card p-6 border-white/5 cursor-pointer transition-all relative overflow-hidden group",
                                    selectedExercise.id === ex.id ? "border-nex-purple/40 bg-nex-purple/5" : "hover:border-white/20",
                                    ex.completed && "opacity-60"
                                )}
                            >
                                {ex.completed && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-nex-neon shadow-neon-glow" />
                                )}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className={cn(
                                            "font-black font-rajdhani italic transition-colors text-lg",
                                            selectedExercise.id === ex.id ? "text-nex-purple" : "text-nex-white"
                                        )}>
                                            {ex.exercises?.name || 'Ejercicio'}
                                        </h4>
                                        <p className="text-[10px] font-bold text-nex-muted uppercase tracking-widest mt-1">
                                            {ex.exercises?.muscle_group || 'General'} · {ex.sets}x{ex.reps}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleComplete(ex.id)
                                        }}
                                        className={cn(
                                            "w-10 h-10 rounded-xl border transition-all flex items-center justify-center",
                                            ex.completed
                                                ? "bg-nex-neon text-black border-nex-neon"
                                                : "border-white/10 text-white/20 hover:border-nex-neon hover:text-nex-neon"
                                        )}
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button className="w-full py-6 rounded-3xl border-2 border-dashed border-white/5 text-nex-muted hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                            <Lock className="w-3 h-3" /> Añadir Ejercicio Premium
                        </button>
                    </div>
                </div>

                {/* Right Column: Detail & Bio-Visualization */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-nex-muted uppercase tracking-[0.3em] flex items-center gap-2">
                            <Dumbbell className="w-4 h-4 text-nex-neon" /> Análisis de Ejecución
                        </h3>
                        <span className="text-[9px] font-bold text-nex-muted uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                            Ejercicio ID: {selectedExercise.id}
                        </span>
                    </div>

                    {/* Muscle Map Implementation */}
                    <MuscleMapDisplay
                        muscleGroup={selectedExercise.exercises?.muscle_group || 'General'}
                        imageUrl={selectedExercise.exercises?.image_url}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-8 group relative overflow-hidden">
                            <span className="block text-[10px] font-bold text-nex-muted uppercase tracking-widest mb-4">Carga de Trabajo</span>
                            <div className="text-5xl font-black font-rajdhani italic text-nex-white">
                                {selectedExercise.weight_kg} kg
                            </div>
                            <div className="mt-4 flex gap-2">
                                <span className="px-2 py-1 rounded bg-nex-purple/20 border border-nex-purple/30 text-[9px] font-bold text-nex-purple uppercase">PR Detectado</span>
                                <span className="px-2 py-1 rounded bg-nex-neon/20 border border-nex-neon/30 text-[9px] font-bold text-nex-neon uppercase">Volumen Alto</span>
                            </div>
                        </div>

                        <div className="glass-card p-8">
                            <span className="block text-[10px] font-bold text-nex-muted uppercase tracking-widest mb-4">Instrucciones Bio-Sync</span>
                            <p className="text-xs text-nex-muted leading-relaxed uppercase font-bold tracking-tight">
                                Mantén una tensión constante en la fase excéntrica. Evita el balanceo inercial para maximizar la activación del {selectedExercise.exercises?.muscle_group}.
                            </p>
                            <div className="mt-6 border-t border-white/5 pt-4">
                                <button className="text-nex-neon text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-2 transition-transform">
                                    Ver Video de Ejecución <Zap className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
