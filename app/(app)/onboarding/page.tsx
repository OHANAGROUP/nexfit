'use client'
import { useState } from 'react'
import {
    Dumbbell, Target, Zap, Heart, ChevronRight, CheckCircle2, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/supabase/hooks'
import { createClient } from '@/lib/supabase/client'

const STEPS = [
    { id: 1, title: 'Bienvenida', subtitle: 'Empecemos con tu perfil' },
    { id: 2, title: 'Tu Objetivo', subtitle: '¿Qué quieres lograr?' },
    { id: 3, title: 'Tu Nivel', subtitle: '¿Cuánto tiempo llevas entrenando?' },
    { id: 4, title: 'Disponibilidad', subtitle: '¿Cuándo puedes entrenar?' },
    { id: 5, title: 'Bio-Inicial', subtitle: 'Tus datos de partida' },
]

const GOALS = [
    { id: 'hypertrophy', label: 'Hipertrofia', desc: 'Ganar músculo y volumen', icon: Dumbbell, color: 'purple' },
    { id: 'fat_loss', label: 'Pérdida de Grasa', desc: 'Reducción de % graso', icon: Target, color: 'neon' },
    { id: 'performance', label: 'Rendimiento', desc: 'Mejorar potencia y fuerza', icon: Zap, color: 'lila' },
    { id: 'health', label: 'Salud General', desc: 'Bienestar y movilidad', icon: Heart, color: 'neon' },
]

const LEVELS = [
    { id: 'beginner', label: 'Principiante', desc: 'Menos de 1 año entrenando' },
    { id: 'intermediate', label: 'Intermedio', desc: '1—3 años de experiencia' },
    { id: 'advanced', label: 'Avanzado', desc: 'Más de 3 años, base sólida' },
]

const TIMES = [
    { id: 'morning', label: 'Mañana', desc: '6:00 — 12:00' },
    { id: 'afternoon', label: 'Tarde', desc: '12:00 — 18:00' },
    { id: 'evening', label: 'Noche', desc: '18:00 — 22:00' },
]

export default function OnboardingPage() {
    const { user } = useAuth()
    const [step, setStep] = useState(1)
    const [saving, setSaving] = useState(false)
    const [done, setDone] = useState(false)

    const [form, setForm] = useState({
        goal: '',
        level: '',
        days_available: 3,
        preferred_time: '',
        weight_kg: '',
        height_cm: '',
    })

    const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }))

    const canContinue = () => {
        if (step === 2) return !!form.goal
        if (step === 3) return !!form.level
        if (step === 4) return !!form.preferred_time
        if (step === 5) return !!form.weight_kg && !!form.height_cm
        return true
    }

    const handleFinish = async () => {
        setSaving(true)
        try {
            const supabase = createClient()
            await (supabase as any).from('onboarding_profiles').upsert({
                user_id: user?.id,
                ...form,
                weight_kg: parseFloat(form.weight_kg),
                height_cm: parseFloat(form.height_cm),
                completed_at: new Date().toISOString(),
            })
        } catch { /* resilient */ } finally {
            setSaving(false)
            setDone(true)
        }
    }

    if (done) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
            <div className="w-24 h-24 rounded-full bg-nex-neon/10 border-2 border-nex-neon flex items-center justify-center shadow-neon-glow">
                <CheckCircle2 className="w-12 h-12 text-nex-neon" />
            </div>
            <div>
                <h1 className="text-4xl font-black italic font-rajdhani tracking-tighter mb-2">¡ONBOARDING COMPLETO!</h1>
                <p className="text-nex-muted text-sm">Tu perfil está listo. Tu entrenador asignará tu protocolo pronto.</p>
            </div>
            <a href="/dashboard" className="mt-4 px-8 py-3 bg-nex-purple rounded-2xl text-white font-bold uppercase tracking-widest text-sm hover:bg-nex-purple/80 transition-all">
                Ir al Dashboard →
            </a>
        </div>
    )

    return (
        <div className="max-w-lg mx-auto space-y-8">
            {/* Progress bar */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-nex-muted uppercase tracking-widest">Paso {step} de {STEPS.length}</span>
                    <span className="text-[10px] font-bold text-nex-purple uppercase tracking-widest">{Math.round((step / STEPS.length) * 100)}% completo</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-nex-purple to-nex-neon rounded-full transition-all duration-500"
                        style={{ width: `${(step / STEPS.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Step header */}
            <div>
                <h1 className="text-3xl font-black italic font-rajdhani tracking-tighter">
                    {STEPS[step - 1].title.toUpperCase()}
                </h1>
                <p className="text-nex-muted text-sm mt-1">{STEPS[step - 1].subtitle}</p>
            </div>

            {/* Step content */}
            <div className="glass-card p-6 space-y-4">
                {/* Step 1: Welcome */}
                {step === 1 && (
                    <div className="text-center space-y-4 py-4">
                        <div className="w-20 h-20 rounded-full bg-nex-purple/20 border border-nex-purple/30 flex items-center justify-center mx-auto">
                            <Dumbbell className="w-10 h-10 text-nex-purple" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic tracking-tighter">BIENVENIDO A <span className="text-nex-neon">NEXFIT</span></h2>
                            <p className="text-nex-muted text-sm mt-2 leading-relaxed">
                                En menos de 2 minutos configuraremos tu perfil atlético para que tu entrenador pueda asignarte el protocolo perfecto.
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 2: Goal */}
                {step === 2 && (
                    <div className="grid grid-cols-2 gap-3">
                        {GOALS.map(g => {
                            const Icon = g.icon
                            const active = form.goal === g.id
                            return (
                                <button
                                    key={g.id}
                                    onClick={() => set('goal', g.id)}
                                    className={cn(
                                        "p-4 rounded-2xl border text-left transition-all",
                                        active
                                            ? "border-nex-purple bg-nex-purple/10 shadow-purple-glow"
                                            : "border-white/5 bg-white/2 hover:border-white/20"
                                    )}
                                >
                                    <Icon className={cn("w-6 h-6 mb-2", active ? "text-nex-neon" : "text-nex-purple")} />
                                    <div className="font-bold text-sm">{g.label}</div>
                                    <div className="text-nex-muted text-[10px] mt-0.5">{g.desc}</div>
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Step 3: Level */}
                {step === 3 && (
                    <div className="space-y-3">
                        {LEVELS.map(l => {
                            const active = form.level === l.id
                            return (
                                <button
                                    key={l.id}
                                    onClick={() => set('level', l.id)}
                                    className={cn(
                                        "w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between",
                                        active ? "border-nex-purple bg-nex-purple/10" : "border-white/5 hover:border-white/20"
                                    )}
                                >
                                    <div>
                                        <div className="font-bold">{l.label}</div>
                                        <div className="text-nex-muted text-[11px] mt-0.5">{l.desc}</div>
                                    </div>
                                    {active && <CheckCircle2 className="w-5 h-5 text-nex-neon shrink-0" />}
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Step 4: Availability */}
                {step === 4 && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-nex-muted uppercase tracking-widest block mb-2">
                                Días por semana: <span className="text-nex-neon">{form.days_available}</span>
                            </label>
                            <input
                                type="range" min={2} max={6} step={1}
                                value={form.days_available}
                                onChange={e => set('days_available', parseInt(e.target.value))}
                                className="w-full accent-nex-purple"
                            />
                            <div className="flex justify-between text-[10px] text-nex-muted mt-1">
                                <span>2 días</span><span>6 días</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-nex-muted uppercase tracking-widest block">Horario preferido</label>
                            {TIMES.map(t => {
                                const active = form.preferred_time === t.id
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => set('preferred_time', t.id)}
                                        className={cn(
                                            "w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all text-sm",
                                            active ? "border-nex-purple bg-nex-purple/10 text-white" : "border-white/5 text-nex-muted hover:border-white/20"
                                        )}
                                    >
                                        <span className="font-bold">{t.label}</span>
                                        <span className="text-[11px]">{t.desc}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Step 5: Bio-initial */}
                {step === 5 && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-nex-muted uppercase tracking-widest block mb-1">Peso actual (kg)</label>
                            <input
                                type="number" placeholder="82.5"
                                value={form.weight_kg}
                                onChange={e => set('weight_kg', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-nex-purple transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-nex-muted uppercase tracking-widest block mb-1">Altura (cm)</label>
                            <input
                                type="number" placeholder="178"
                                value={form.height_cm}
                                onChange={e => set('height_cm', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-nex-purple transition-colors"
                            />
                        </div>
                        {form.weight_kg && form.height_cm && (
                            <div className="p-4 rounded-xl bg-nex-neon/5 border border-nex-neon/20 text-center">
                                <div className="text-[10px] font-bold text-nex-muted uppercase tracking-widest mb-1">Tu IMC</div>
                                <div className="text-3xl font-black italic font-rajdhani text-nex-neon">
                                    {(parseFloat(form.weight_kg) / Math.pow(parseFloat(form.height_cm) / 100, 2)).toFixed(1)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
                {step > 1 && (
                    <button
                        onClick={() => setStep(s => s - 1)}
                        className="px-6 py-3 rounded-2xl border border-white/10 text-nex-muted hover:text-white hover:border-white/30 transition-all font-bold uppercase tracking-widest text-sm"
                    >
                        Atrás
                    </button>
                )}
                <button
                    onClick={step < STEPS.length ? () => setStep(s => s + 1) : handleFinish}
                    disabled={!canContinue() || saving}
                    className={cn(
                        "flex-1 py-3 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all",
                        canContinue() && !saving
                            ? "bg-nex-purple text-white hover:bg-nex-purple/80 shadow-purple-glow"
                            : "bg-white/5 text-nex-muted cursor-not-allowed"
                    )}
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {step < STEPS.length ? 'Continuar' : 'Finalizar'}
                    {!saving && <ChevronRight className="w-4 h-4" />}
                </button>
            </div>
        </div>
    )
}
