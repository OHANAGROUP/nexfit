'use client'
import { useAthletes } from '@/lib/supabase/hooks'
import { FileText, Download, Users, Loader2 } from 'lucide-react'
import Link from 'next/link'

const ADHERENCE_MOCK: Record<string, number> = {
    '1': 90, '2': 75, '3': 92, '4': 57,
}
const PLAN_MOCK: Record<string, string> = {
    '1': 'Pro', '2': 'Básico', '3': 'Elite', '4': 'Pro',
}

export default function ReportesPage() {
    const { athletes, loading } = useAthletes()

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-nex-purple animate-spin" />
        </div>
    )

    return (
        <div className="space-y-10">
            {/* Header */}
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded bg-nex-purple text-white text-[10px] font-bold uppercase tracking-widest">Reportes PDF</span>
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter font-rajdhani">
                    REPOR<span className="text-nex-neon">TES</span>
                </h1>
                <p className="text-nex-muted text-sm mt-1">Generá el reporte mensual de cada atleta en un clic — imprimí o guardá como PDF</p>
            </header>

            {/* Info strip */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-nex-neon/20 bg-nex-neon/5 text-sm">
                <FileText className="w-4 h-4 text-nex-neon mt-0.5 shrink-0" />
                <div className="text-nex-white/80 text-xs">
                    Hacé click en <strong className="text-nex-neon">Ver Reporte</strong> para abrir el reporte en pantalla, luego usá <strong className="text-nex-white">Imprimir / Guardar PDF</strong> en la barra superior para exportarlo. Compatible con Chrome, Edge y Safari.
                </div>
            </div>

            {/* Athlete list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {athletes.map((athlete: any) => {
                    const adherence = ADHERENCE_MOCK[athlete.id] ?? 80
                    const plan = PLAN_MOCK[athlete.id] ?? 'Básico'
                    const color = adherence >= 90 ? 'text-nex-neon' : adherence >= 75 ? 'text-yellow-400' : 'text-red-400'
                    const bgColor = adherence >= 90 ? 'bg-nex-neon' : adherence >= 75 ? 'bg-yellow-400' : 'bg-red-400'

                    return (
                        <div key={athlete.id} className="glass-card p-5 flex items-center justify-between group hover:border-nex-purple/40 transition-all">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-11 h-11 rounded-full bg-nex-purple/20 border border-nex-purple/30 flex items-center justify-center font-black italic text-lg text-nex-purple font-rajdhani">
                                    {athlete.full_name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-black italic tracking-tighter">{athlete.full_name}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] font-bold text-nex-muted uppercase tracking-widest">{plan}</span>
                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{
                                            background: adherence >= 90 ? 'rgba(0,245,160,0.1)' : adherence >= 75 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                            color: adherence >= 90 ? '#00f5a0' : adherence >= 75 ? '#f59e0b' : '#ef4444',
                                            border: `1px solid ${adherence >= 90 ? 'rgba(0,245,160,0.2)' : adherence >= 75 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`
                                        }}>
                                            {adherence}% adherencia
                                        </span>
                                    </div>
                                    {/* Mini adherence bar */}
                                    <div className="h-1 w-28 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                                        <div className={`h-full rounded-full ${bgColor}/60`} style={{ width: `${adherence}%` }} />
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`/reportes/${athlete.id}`}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-nex-purple/20 border border-nex-purple/30 text-nex-purple text-xs font-black hover:bg-nex-purple hover:text-white transition-all group-hover:scale-105"
                            >
                                <FileText className="w-3.5 h-3.5" />
                                Ver Reporte
                            </Link>
                        </div>
                    )
                })}
            </div>

            {/* Footer note */}
            <div className="flex items-center gap-2 text-[10px] text-nex-muted">
                <Users className="w-3 h-3" />
                <span>{athletes.length} atletas — Los reportes incluyen adherencia, progreso de peso, ejercicios, membresía y nota del entrenador.</span>
            </div>
        </div>
    )
}
