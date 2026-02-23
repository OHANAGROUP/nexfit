'use client'
import { useState } from 'react'
import {
    CalendarDays, ChevronLeft, ChevronRight,
    CheckCircle2, Clock, XCircle, Loader2, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth, useCalendar } from '@/lib/supabase/hooks'
import { createClient } from '@/lib/supabase/client'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    planned: { label: 'Planificado', color: 'text-nex-muted border-white/10 bg-white/5', icon: Clock },
    done: { label: 'Completado', color: 'text-nex-neon border-nex-neon/30 bg-nex-neon/10', icon: CheckCircle2 },
    skipped: { label: 'Omitido', color: 'text-red-400 border-red-400/30 bg-red-400/10', icon: XCircle },
}

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function getWeekDates(ref: Date) {
    const start = new Date(ref)
    const day = start.getDay()
    start.setDate(start.getDate() - day + 1) // start on Monday
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        return d
    })
}

export default function CalendarioPage() {
    const { user } = useAuth()
    const { schedule, loading, isMock } = useCalendar(user?.id)
    const [weekRef, setWeekRef] = useState(new Date('2026-02-23'))

    const weekDates = getWeekDates(weekRef)

    const prevWeek = () => {
        const d = new Date(weekRef)
        d.setDate(d.getDate() - 7)
        setWeekRef(d)
    }
    const nextWeek = () => {
        const d = new Date(weekRef)
        d.setDate(d.getDate() + 7)
        setWeekRef(d)
    }

    const getSessionForDate = (date: Date) => {
        const iso = date.toISOString().split('T')[0]
        return schedule.find(s => s.scheduled_for === iso)
    }

    const toggleStatus = async (session: any) => {
        const next = session.status === 'planned' ? 'done' : session.status === 'done' ? 'skipped' : 'planned'
        try {
            const supabase = createClient()
            await (supabase as any).from('training_schedule').update({ status: next }).eq('id', session.id)
        } catch { /* resilient */ }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-nex-purple animate-spin" />
        </div>
    )

    const weekLabel = `${weekDates[0].toLocaleDateString('es', { day: 'numeric', month: 'short' })} — ${weekDates[6].toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}`

    return (
        <div className="space-y-10">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded bg-nex-purple text-white text-[10px] font-bold uppercase tracking-widest">
                        Semana Activa
                    </span>
                    {isMock && (
                        <span className="px-2 py-0.5 rounded bg-nex-neon/20 border border-nex-neon/30 text-nex-neon text-[10px] font-bold uppercase tracking-widest">
                            Demo Mode
                        </span>
                    )}
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter font-rajdhani">
                    CALEN<span className="text-nex-neon">DARIO</span>
                </h1>
                <p className="text-nex-muted text-sm mt-1">{weekLabel}</p>
            </header>

            {/* Week Navigator */}
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={prevWeek}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-white/10 text-nex-muted hover:text-white hover:border-white/30 transition-all text-sm font-bold"
                >
                    <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <span className="font-bold text-sm uppercase tracking-widest">{weekLabel}</span>
                <button
                    onClick={nextWeek}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-white/10 text-nex-muted hover:text-white hover:border-white/30 transition-all text-sm font-bold"
                >
                    Siguiente <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Weekly Grid */}
            <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date, i) => {
                    const session = getSessionForDate(date)
                    const isToday = date.toDateString() === new Date('2026-02-23').toDateString()
                    const cfg = session ? STATUS_CONFIG[session.status] : null
                    const StatusIcon = cfg?.icon

                    return (
                        <div
                            key={i}
                            className={cn(
                                "glass-card p-3 flex flex-col gap-2 min-h-[120px] transition-all",
                                isToday ? "border-nex-purple/50 shadow-purple-glow" : "border-white/5",
                                session ? "cursor-pointer hover:scale-[1.02]" : "opacity-60"
                            )}
                            onClick={() => session && toggleStatus(session)}
                        >
                            <div className="text-center">
                                <div className={cn("text-[10px] font-bold uppercase tracking-widest", isToday ? "text-nex-neon" : "text-nex-muted")}>
                                    {DAYS_ES[date.getDay()]}
                                </div>
                                <div className={cn("text-xl font-black italic tracking-tighter font-rajdhani", isToday ? "text-nex-neon" : "text-nex-white")}>
                                    {date.getDate()}
                                </div>
                            </div>

                            {session && cfg && StatusIcon ? (
                                <div className={cn("flex-1 rounded-xl border p-2 text-center flex flex-col items-center justify-center gap-1 transition-all", cfg.color)}>
                                    <StatusIcon className="w-4 h-4" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">{cfg.label}</span>
                                </div>
                            ) : (
                                <div className="flex-1 rounded-xl border border-dashed border-white/5 flex items-center justify-center">
                                    <span className="text-[9px] text-nex-muted uppercase tracking-widest">Descanso</span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Session detail strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedule.map(s => {
                    const cfg = STATUS_CONFIG[s.status]
                    const StatusIcon = cfg?.icon
                    return (
                        <div key={s.id} className={cn("glass-card p-4 flex items-center justify-between border", cfg.color)}>
                            <div className="flex items-center gap-3">
                                {StatusIcon && <StatusIcon className="w-5 h-5" />}
                                <div>
                                    <div className="font-bold text-sm">{s.day_name}</div>
                                    <div className="text-[11px] text-nex-muted">{new Date(s.scheduled_for + 'T12:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-nex-purple" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{cfg.label}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
