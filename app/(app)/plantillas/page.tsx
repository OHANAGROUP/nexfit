'use client'
import { useState } from 'react'
import {
    LayoutList, Plus, Users, Zap, ChevronRight, X, CheckCircle2,
    Loader2, Dumbbell, Target, Heart, SlidersHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTemplates, useAthletes, useAuth } from '@/lib/supabase/hooks'
import { createClient } from '@/lib/supabase/client'

const LEVEL_COLORS: Record<string, string> = {
    beginner: 'text-nex-neon border-nex-neon/30 bg-nex-neon/10',
    intermediate: 'text-nex-purple border-nex-purple/30 bg-nex-purple/10',
    advanced: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
    all: 'text-nex-lila border-nex-lila/30 bg-nex-lila/10',
}

const GOAL_ICONS: Record<string, any> = {
    hypertrophy: Dumbbell,
    fat_loss: Target,
    performance: Zap,
    health: Heart,
    general: SlidersHorizontal,
}

const GOAL_LABELS: Record<string, string> = {
    hypertrophy: 'Hipertrofia',
    fat_loss: 'Fat Loss',
    performance: 'Rendimiento',
    health: 'Salud',
    general: 'General',
}

const LEVEL_LABELS: Record<string, string> = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
    all: 'Todos',
}

function AssignModal({ template, athletes, onClose }: { template: any; athletes: any[]; onClose: () => void }) {
    const [selected, setSelected] = useState<string[]>([])
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [saving, setSaving] = useState(false)
    const [done, setDone] = useState(false)
    const { user } = useAuth()

    const toggle = (id: string) =>
        setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

    const handleAssign = async () => {
        setSaving(true)
        try {
            const supabase = createClient()
            const rows = selected.map(athlete_id => ({
                template_id: template.id,
                athlete_id,
                assigned_by: user?.id,
                start_date: startDate,
                status: 'active',
            }))
            await (supabase as any).from('template_assignments').upsert(rows, { onConflict: 'template_id,athlete_id' })
        } catch { /* resilient */ } finally {
            setSaving(false)
            setDone(true)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="glass-card w-full max-w-md p-6 space-y-5" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-black italic tracking-tighter text-lg">ASIGNAR PROTOCOLO</h3>
                        <p className="text-nex-muted text-[11px] mt-0.5">{template.name}</p>
                    </div>
                    <button onClick={onClose} className="text-nex-muted hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {done ? (
                    <div className="text-center py-6 space-y-3">
                        <CheckCircle2 className="w-12 h-12 text-nex-neon mx-auto" />
                        <p className="font-bold text-nex-neon">¡Asignado a {selected.length} atleta{selected.length !== 1 ? 's' : ''}!</p>
                        <button onClick={onClose} className="mt-2 px-6 py-2 bg-nex-purple rounded-xl text-white font-bold text-sm uppercase tracking-widest hover:bg-nex-purple/80 transition-all">
                            Cerrar
                        </button>
                    </div>
                ) : (
                    <>
                        <div>
                            <label className="text-[10px] font-bold text-nex-muted uppercase tracking-widest block mb-2">Fecha de inicio</label>
                            <input
                                type="date" value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-nex-purple transition-colors"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-nex-muted uppercase tracking-widest block mb-2">
                                Seleccionar atletas ({selected.length} seleccionados)
                            </label>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {athletes.map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => toggle(a.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-sm",
                                            selected.includes(a.id)
                                                ? "border-nex-purple bg-nex-purple/10 text-white"
                                                : "border-white/5 text-nex-muted hover:border-white/20"
                                        )}
                                    >
                                        <span className="font-bold">{a.full_name}</span>
                                        {selected.includes(a.id) && <CheckCircle2 className="w-4 h-4 text-nex-neon" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleAssign}
                            disabled={selected.length === 0 || saving}
                            className={cn(
                                "w-full py-3 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all",
                                selected.length > 0 && !saving
                                    ? "bg-nex-purple text-white hover:bg-nex-purple/80 shadow-purple-glow"
                                    : "bg-white/5 text-nex-muted cursor-not-allowed"
                            )}
                        >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            Confirmar Asignación
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default function PlantillasPage() {
    const { templates, loading, isMock } = useTemplates()
    const { athletes } = useAthletes()
    const [assigning, setAssigning] = useState<any>(null)

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-nex-purple animate-spin" />
        </div>
    )

    return (
        <div className="space-y-10">
            <header className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 rounded bg-nex-purple text-white text-[10px] font-bold uppercase tracking-widest">
                            Trainer Panel
                        </span>
                        {isMock && (
                            <span className="px-2 py-0.5 rounded bg-nex-neon/20 border border-nex-neon/30 text-nex-neon text-[10px] font-bold uppercase tracking-widest">
                                Demo Mode
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter font-rajdhani">
                        PLAN<span className="text-nex-neon">TILLAS</span>
                    </h1>
                    <p className="text-nex-muted text-sm mt-1">{templates.length} protocolos disponibles</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-3 bg-nex-purple rounded-2xl text-white font-bold text-sm uppercase tracking-widest hover:bg-nex-purple/80 transition-all shadow-purple-glow">
                    <Plus className="w-4 h-4" />
                    Nuevo Protocolo
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {templates.map(tpl => {
                    const GoalIcon = GOAL_ICONS[tpl.goal_type] || SlidersHorizontal
                    return (
                        <div key={tpl.id} className="glass-card p-6 group relative overflow-hidden hover:scale-[1.01] transition-all">
                            {/* glow */}
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-nex-purple blur-[50px] opacity-10 pointer-events-none group-hover:opacity-25 transition-opacity" />

                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-nex-purple/10 border border-nex-purple/20 flex items-center justify-center">
                                    <GoalIcon className="w-5 h-5 text-nex-purple" />
                                </div>
                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border", LEVEL_COLORS[tpl.target_level])}>
                                    {LEVEL_LABELS[tpl.target_level]}
                                </span>
                            </div>

                            <h3 className="font-black italic tracking-tighter text-lg leading-tight mb-1">{tpl.name}</h3>
                            {tpl.description && (
                                <p className="text-nex-muted text-[11px] mb-3">{tpl.description}</p>
                            )}

                            <div className="flex gap-4 text-[11px] text-nex-muted font-bold mb-4">
                                <span className="flex items-center gap-1">
                                    <Dumbbell className="w-3 h-3 text-nex-purple" />
                                    {tpl.exercises?.length || 0} ejercicios
                                </span>
                                <span className="flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-nex-neon" />
                                    {tpl.days_per_week}d/sem
                                </span>
                                <span className="flex items-center gap-1">
                                    <Target className="w-3 h-3 text-nex-lila" />
                                    {GOAL_LABELS[tpl.goal_type]}
                                </span>
                            </div>

                            <button
                                onClick={() => setAssigning(tpl)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-nex-purple/10 border border-nex-purple/20 text-nex-purple font-bold text-xs uppercase tracking-widest hover:bg-nex-purple hover:text-white transition-all"
                            >
                                <Users className="w-4 h-4" />
                                Asignar a Atletas
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    )
                })}
            </div>

            {assigning && (
                <AssignModal
                    template={assigning}
                    athletes={athletes}
                    onClose={() => setAssigning(null)}
                />
            )}
        </div>
    )
}
