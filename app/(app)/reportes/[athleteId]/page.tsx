'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAthletes, useAnalytics, useMemberships } from '@/lib/supabase/hooks'
import { Printer, ArrowLeft, Download } from 'lucide-react'

// Print-only CSS injected inline for PDF fidelity
const PRINT_STYLES = `
@media print {
    .no-print { display: none !important; }
    .page-break { page-break-after: always; }
    body { background: white !important; color: black !important; }
    .report-wrapper { background: white !important; color: #111 !important; padding: 0 !important; }
    .glass-section { border: 1px solid #e5e7eb !important; background: white !important; }
    .stat-value { color: #7b2fff !important; }
    .muted { color: #6b7280 !important; }
    @page { margin: 1.5cm; size: A4; }
}
`

const MOCK_REPORT_DATA: Record<string, any> = {
    '1': {
        athlete: { id: '1', full_name: 'PABLO PALOMINOS', email: 'pablo@nexfit.cl', goal: 'Hipertrofia', level: 'Intermedio', weight: 81.7, height: 178 },
        sessions: { planned: 20, completed: 18, missed: 2, adherence: 90 },
        streak: 12,
        weight_trend: [82.5, 82.3, 82.1, 81.9, 82.0, 81.8, 81.7],
        exercises: [
            { name: 'Sentadilla Profunda', sets: 4, reps: 12, weight: 85, pr: true },
            { name: 'Press Banca', sets: 4, reps: 10, weight: 80, pr: false },
            { name: 'Press Militar', sets: 3, reps: 10, weight: 62, pr: true },
            { name: 'Remo con Barra', sets: 4, reps: 10, weight: 70, pr: false },
        ],
        membership: { plan: 'Pro', expires_at: '2026-03-20', status: 'active', monthly_fee: 1200 },
        coach_note: 'Pablo mantiene una adherencia de élite. Se recomienda aumentar la carga en sentadilla y press banca en un 5% el próximo ciclo. Evaluar introducción de periodización ondulante.',
    },
    '2': {
        athlete: { id: '2', full_name: 'MARIA GARCIA', email: 'maria@nexfit.cl', goal: 'Pérdida de Peso', level: 'Principiante', weight: 65.2, height: 165 },
        sessions: { planned: 16, completed: 12, missed: 4, adherence: 75 },
        streak: 5,
        weight_trend: [67.0, 66.5, 66.3, 66.0, 65.8, 65.5, 65.2],
        exercises: [
            { name: 'Sentadilla Goblet', sets: 3, reps: 15, weight: 16, pr: false },
            { name: 'Flexiones', sets: 3, reps: 10, weight: 0, pr: true },
            { name: 'Hip Thrust', sets: 3, reps: 15, weight: 40, pr: false },
        ],
        membership: { plan: 'Básico', expires_at: '2026-02-28', status: 'expiring', monthly_fee: 800 },
        coach_note: 'María muestra buen progreso en composición corporal (-1.8kg este mes). Se recomienda mejorar consistencia los días martes y jueves. Ajustar plan nutricional para optimizar déficit calórico.',
    },
    '3': {
        athlete: { id: '3', full_name: 'JUAN PEREZ', email: 'juan@nexfit.cl', goal: 'Fuerza', level: 'Avanzado', weight: 92.0, height: 182 },
        sessions: { planned: 12, completed: 11, missed: 1, adherence: 92 },
        streak: 8,
        weight_trend: [91.5, 91.8, 92.0, 92.0, 91.8, 92.0, 92.0],
        exercises: [
            { name: 'Peso Muerto', sets: 5, reps: 4, weight: 160, pr: true },
            { name: 'Sentadilla', sets: 5, reps: 5, weight: 130, pr: false },
            { name: 'Press Banca', sets: 4, reps: 5, weight: 100, pr: true },
        ],
        membership: { plan: 'Elite', expires_at: '2026-04-15', status: 'active', monthly_fee: 1800 },
        coach_note: 'Juan alcanzó un nuevo PR en peso muerto (160kg). Adherencia de élite. Continuar con el ciclo de fuerza máxima. Revisar técnica de sentadilla profunda en la próxima sesión.',
    },
    '4': {
        athlete: { id: '4', full_name: 'ANA SOTO', email: 'ana@nexfit.cl', goal: 'Acondicionamiento', level: 'Intermedio', weight: 58.5, height: 162 },
        sessions: { planned: 14, completed: 8, missed: 6, adherence: 57 },
        streak: 2,
        weight_trend: [59.0, 58.9, 58.8, 58.7, 58.6, 58.5, 58.5],
        exercises: [
            { name: 'Burpees', sets: 4, reps: 10, weight: 0, pr: false },
            { name: 'Kettlebell Swing', sets: 4, reps: 15, weight: 20, pr: false },
        ],
        membership: { plan: 'Pro', expires_at: '2026-03-01', status: 'expiring', monthly_fee: 1200 },
        coach_note: 'Ana necesita mejorar su constancia. Se registraron 6 sesiones no completadas este mes. Recomiendo contacto directo para identificar bloqueos. Reducir intensidad si hay fatiga acumulada.',
    },
}

function MiniBarChart({ values }: { values: number[] }) {
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1

    return (
        <div className="flex items-end gap-1 h-12">
            {values.map((v, i) => {
                const height = ((v - min) / range) * 100
                const isLast = i === values.length - 1
                return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                        <div
                            className={`w-full rounded-sm transition-all ${isLast ? 'bg-[#7b2fff]' : 'bg-[#7b2fff]/30'}`}
                            style={{ height: `${Math.max(15, height)}%` }}
                        />
                        {isLast && <span className="text-[8px] font-black text-[#7b2fff]">{v}kg</span>}
                    </div>
                )
            })}
        </div>
    )
}

export default function AthleteReportPage() {
    const params = useParams()
    const router = useRouter()
    const athleteId = params?.athleteId as string
    const reportData = MOCK_REPORT_DATA[athleteId] || MOCK_REPORT_DATA['1']
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    const { athlete, sessions, streak, weight_trend, exercises, membership, coach_note } = reportData
    const reportMonth = new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }).toUpperCase()
    const bmi = (athlete.weight / ((athlete.height / 100) ** 2)).toFixed(1)
    const adherenceColor = sessions.adherence >= 90 ? '#00f5a0' : sessions.adherence >= 75 ? '#f59e0b' : '#ef4444'

    if (!mounted) return null

    return (
        <>
            <style>{PRINT_STYLES}</style>

            {/* Toolbar — hidden on print */}
            <div className="no-print fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-nex-black/95 border-b border-white/10 backdrop-blur-sm">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-nex-muted hover:text-white transition-colors text-sm font-bold"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-nex-purple text-white text-sm font-black hover:bg-nex-purple/80 transition-all"
                    >
                        <Printer className="w-4 h-4" />
                        Imprimir / Guardar PDF
                    </button>
                </div>
            </div>

            {/* Report — print-optimized */}
            <div className="report-wrapper pt-16 no-print-pt md:pt-20">
                <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-6">

                    {/* Header */}
                    <div className="glass-section rounded-2xl p-6 flex justify-between items-start border border-nex-purple/20">
                        <div>
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-nex-purple mb-1">NEXFIT — REPORTE MENSUAL</div>
                            <h1 className="text-3xl font-black italic tracking-tighter font-rajdhani">{athlete.full_name}</h1>
                            <div className="text-nex-muted text-xs mt-1">{athlete.email}</div>
                            <div className="flex gap-3 mt-3">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-nex-purple/20 text-nex-purple border border-nex-purple/30">{athlete.goal}</span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-white/5 text-nex-muted border border-white/10">{athlete.level}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[9px] font-black uppercase tracking-widest text-nex-muted">PERÍODO</div>
                            <div className="text-sm font-black italic text-nex-white mt-0.5">{reportMonth}</div>
                            <div className="mt-2 text-[9px] text-nex-muted">{new Date().toLocaleDateString('es-CL')}</div>
                        </div>
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { label: 'Adherencia', value: `${sessions.adherence}%`, sub: `${sessions.completed}/${sessions.planned} ses.`, color: adherenceColor },
                            { label: 'Racha Actual', value: `${streak}d`, sub: 'sesiones consec.', color: '#7b2fff' },
                            { label: 'Peso Actual', value: `${athlete.weight}kg`, sub: `IMC ${bmi}`, color: '#00f5a0' },
                            { label: 'Sesiones', value: sessions.completed, sub: `${sessions.missed} omitidas`, color: '#a855f7' },
                        ].map(({ label, value, sub, color }) => (
                            <div key={label} className="glass-section rounded-xl p-4 border border-white/5">
                                <div className="text-[8px] font-bold uppercase tracking-widest text-nex-muted">{label}</div>
                                <div className="text-2xl font-black italic font-rajdhani tracking-tighter mt-1" style={{ color }}>{value}</div>
                                <div className="text-[8px] text-nex-muted font-bold uppercase tracking-wider mt-0.5">{sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* Adherence bar */}
                    <div className="glass-section rounded-xl px-5 py-4 border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-nex-muted">PROGRESO DE ADHERENCIA</span>
                            <span className="text-[9px] font-black" style={{ color: adherenceColor }}>{sessions.adherence}% — {sessions.adherence >= 90 ? '🔥 ÉLITE' : sessions.adherence >= 75 ? '⚡ BUENO' : '⚠️ MEJORAR'}</span>
                        </div>
                        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${sessions.adherence}%`, background: adherenceColor }}
                            />
                        </div>
                        <div className="flex justify-between mt-1.5">
                            <span className="text-[7px] text-nex-muted font-bold">0%</span>
                            <span className="text-[7px] text-nex-muted font-bold">Objetivo: 90%</span>
                            <span className="text-[7px] text-nex-muted font-bold">100%</span>
                        </div>
                    </div>

                    {/* Weight trend + Exercises */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-section rounded-xl p-5 border border-white/5">
                            <div className="text-[9px] font-black uppercase tracking-widest text-nex-muted mb-3">EVOLUCIÓN DE PESO</div>
                            <MiniBarChart values={weight_trend} />
                            <div className="flex justify-between mt-2">
                                <div>
                                    <div className="text-[8px] text-nex-muted">Inicio</div>
                                    <div className="text-sm font-black text-nex-white">{weight_trend[0]}kg</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[8px] text-nex-muted">Actual</div>
                                    <div className="text-sm font-black text-nex-neon">{weight_trend[weight_trend.length - 1]}kg</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[8px] text-nex-muted">Δ</div>
                                    <div className={`text-sm font-black ${weight_trend[weight_trend.length - 1] < weight_trend[0] ? 'text-nex-neon' : 'text-orange-400'}`}>
                                        {(weight_trend[weight_trend.length - 1] - weight_trend[0]).toFixed(1)}kg
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-section rounded-xl p-5 border border-white/5">
                            <div className="text-[9px] font-black uppercase tracking-widest text-nex-muted mb-3">EJERCICIOS DEL MES</div>
                            <div className="space-y-2">
                                {exercises.map((ex: any) => (
                                    <div key={ex.name} className="flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] font-bold text-nex-white">{ex.name}</div>
                                            <div className="text-[8px] text-nex-muted">{ex.sets}×{ex.reps} {ex.weight > 0 ? `@ ${ex.weight}kg` : 'peso corporal'}</div>
                                        </div>
                                        {ex.pr && (
                                            <span className="px-1.5 py-0.5 rounded text-[7px] font-black bg-nex-neon/20 text-nex-neon border border-nex-neon/30">PR</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Membership */}
                    <div className="glass-section rounded-xl p-5 border border-white/5 flex items-center justify-between">
                        <div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-nex-muted mb-1">MEMBRESÍA</div>
                            <div className="text-lg font-black italic text-nex-white">{membership.plan}</div>
                            <div className="text-[9px] text-nex-muted mt-0.5">Vence: {new Date(membership.expires_at).toLocaleDateString('es-CL')}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[9px] font-black uppercase tracking-widest text-nex-muted">CUOTA MENSUAL</div>
                            <div className="text-2xl font-black italic text-nex-neon font-rajdhani">${membership.monthly_fee.toLocaleString('es-CL')}</div>
                            <div className={`text-[8px] font-black uppercase mt-0.5 ${membership.status === 'active' ? 'text-nex-neon' : 'text-yellow-400'}`}>
                                {membership.status === 'active' ? '● ACTIVA' : '⚠ POR VENCER'}
                            </div>
                        </div>
                    </div>

                    {/* Coach Note */}
                    <div className="glass-section rounded-xl p-5 border border-nex-purple/20 bg-nex-purple/5">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-nex-purple/30 flex items-center justify-center text-[10px]">✍️</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-nex-purple">NOTA DEL ENTRENADOR</div>
                        </div>
                        <p className="text-sm text-nex-white/80 leading-relaxed italic">{coach_note}</p>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-[8px] text-nex-muted font-bold uppercase tracking-widest pt-2 pb-4">
                        NEXFIT © {new Date().getFullYear()} — Reporte generado automáticamente — {new Date().toLocaleString('es-CL')}
                    </div>
                </div>
            </div>
        </>
    )
}
