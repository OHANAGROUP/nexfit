'use client'
import { useMemberships, useMembershipPlans } from '@/lib/supabase/hooks'
import {
    CreditCard, Users, TrendingUp, AlertTriangle, CheckCircle,
    XCircle, PauseCircle, Plus, ChevronRight, Calendar, DollarSign
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    active: { label: 'Activo', color: 'text-nex-neon', bg: 'bg-nex-neon/10 border-nex-neon/30', icon: CheckCircle },
    expired: { label: 'Vencido', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: XCircle },
    suspended: { label: 'Suspendido', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: PauseCircle },
    cancelled: { label: 'Cancelado', color: 'text-nex-muted', bg: 'bg-white/5 border-white/10', icon: XCircle },
}

const PLAN_COLOR: Record<string, string> = {
    'Básico': 'text-blue-400',
    'Pro': 'text-nex-purple',
    'Elite': 'text-nex-neon',
}

function daysLeft(expiresAt: string) {
    return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000)
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

function NewMembershipModal({ plans, onClose, onCreate }: {
    plans: any[]; onClose: () => void; onCreate: (p: any) => void
}) {
    const [athleteId, setAthleteId] = useState('')
    const [athleteName, setAthleteName] = useState('')
    const [planId, setPlanId] = useState(plans[0]?.id ?? '')
    const [startsAt, setStartsAt] = useState(new Date().toISOString().split('T')[0])
    const selectedPlan = plans.find(p => p.id === planId)
    const expiresAt = selectedPlan
        ? new Date(new Date(startsAt).getTime() + selectedPlan.duration_days * 86400000).toISOString().split('T')[0]
        : ''

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onCreate({ user_id: athleteId || Date.now().toString(), plan_id: planId, starts_at: startsAt, expires_at: expiresAt, _athlete_name: athleteName, _plan_name: selectedPlan?.name, _price: selectedPlan?.price })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="glass-card p-8 w-full max-w-md mx-4 space-y-6">
                <h2 className="font-black italic tracking-tighter text-xl">NUEVA MEMBRESÍA</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-nex-muted mb-1 block">Nombre del Atleta</label>
                        <input
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-nex-purple/50"
                            placeholder="Ej: Carlos Mendez"
                            value={athleteName}
                            onChange={e => setAthleteName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-nex-muted mb-1 block">Plan</label>
                        <select
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-nex-purple/50"
                            value={planId}
                            onChange={e => setPlanId(e.target.value)}
                        >
                            {plans.map(p => (
                                <option key={p.id} value={p.id} style={{ background: '#12121a' }}>
                                    {p.name} — ${p.price.toLocaleString('es-CL')}/mes
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-nex-muted mb-1 block">Fecha de inicio</label>
                        <input
                            type="date"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-nex-purple/50"
                            value={startsAt}
                            onChange={e => setStartsAt(e.target.value)}
                        />
                    </div>
                    {expiresAt && (
                        <div className="flex items-center gap-2 text-xs text-nex-muted px-1">
                            <Calendar className="w-3 h-3" />
                            <span>Vence el <strong className="text-nex-white">{formatDate(expiresAt)}</strong></span>
                        </div>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-white/10 text-nex-muted hover:text-white hover:bg-white/5 transition-all text-sm font-bold">
                            Cancelar
                        </button>
                        <button type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-nex-purple text-white font-black text-sm hover:bg-nex-purple/80 transition-all shadow-purple-glow">
                            Crear Membresía
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function MembresiasPage() {
    const { memberships, loading, isMock, updateStatus, expiringCount, activeCount, monthlyRevenue, createMembership } = useMemberships()
    const { plans } = useMembershipPlans()
    const [showModal, setShowModal] = useState(false)
    const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'suspended'>('all')

    const filtered = filter === 'all' ? memberships : memberships.filter(m => m.status === filter)

    const handleCreate = async (payload: any) => {
        await createMembership(payload)
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded bg-nex-purple text-white text-[10px] font-bold uppercase tracking-widest">Módulo Membresías</span>
                    {isMock && <span className="px-2 py-0.5 rounded bg-nex-neon/20 border border-nex-neon/30 text-nex-neon text-[10px] font-bold uppercase tracking-widest">Demo Mode</span>}
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter font-rajdhani">
                    MEMBR<span className="text-nex-neon">ESÍAS</span>
                </h1>
                <p className="text-nex-muted text-sm mt-1">Gestión de planes y suscripciones activas</p>
            </header>

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-nex-neon" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-nex-muted">Activas</span>
                    </div>
                    <div className="text-3xl font-black italic text-nex-neon">{loading ? '...' : activeCount}</div>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-nex-purple" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-nex-muted">Ingreso/Mes</span>
                    </div>
                    <div className="text-3xl font-black italic text-nex-purple">${loading ? '...' : monthlyRevenue.toLocaleString('es-CL')}</div>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-nex-muted">Por Vencer</span>
                    </div>
                    <div className={cn("text-3xl font-black italic", expiringCount > 0 ? 'text-yellow-400' : 'text-nex-muted')}>
                        {loading ? '...' : expiringCount}
                    </div>
                </div>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-nex-muted">Total</span>
                    </div>
                    <div className="text-3xl font-black italic text-blue-400">{loading ? '...' : memberships.length}</div>
                </div>
            </div>

            {/* Expiry Warning Strip */}
            {expiringCount > 0 && (
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span className="text-sm font-bold text-yellow-300">
                        {expiringCount} membresía{expiringCount > 1 ? 's' : ''} vence{expiringCount === 1 ? '' : 'n'} en los próximos 7 días — Contactar atletas
                    </span>
                </div>
            )}

            {/* Plans strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan: any) => (
                    <div key={plan.id} className="glass-card p-5 border-nex-purple/20">
                        <div className="flex justify-between items-start mb-2">
                            <span className={cn("font-black italic tracking-tighter text-lg", PLAN_COLOR[plan.name] ?? 'text-nex-white')}>{plan.name}</span>
                            <span className="font-black text-sm text-nex-white">${plan.price.toLocaleString('es-CL')}<span className="text-nex-muted font-normal text-xs">/mes</span></span>
                        </div>
                        <ul className="space-y-1 mt-3">
                            {plan.features.map((f: string) => (
                                <li key={f} className="text-[11px] text-nex-muted flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-nex-purple shrink-0" />{f}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Membership List */}
            <div className="glass-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <h2 className="font-black italic tracking-tighter text-lg">ATLETAS</h2>
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Filters */}
                        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                            {(['all', 'active', 'expired', 'suspended'] as const).map(f => (
                                <button key={f} onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                        filter === f ? 'bg-nex-purple text-white' : 'text-nex-muted hover:text-white'
                                    )}>
                                    {f === 'all' ? 'Todas' : STATUS_CONFIG[f]?.label ?? f}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-nex-neon text-black font-black text-xs uppercase tracking-widest hover:bg-nex-neon/80 transition-all">
                            <Plus className="w-4 h-4" /> Nueva
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {filtered.map((m: any) => {
                        const cfg = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.cancelled
                        const Icon = cfg.icon
                        const days = daysLeft(m.expires_at)
                        const isExpiring = m.status === 'active' && days <= 7 && days >= 0

                        return (
                            <div key={m.id} className={cn(
                                "flex flex-wrap items-center gap-4 p-4 rounded-xl border transition-all",
                                isExpiring ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-white/2 border-white/5'
                            )}>
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-nex-purple/20 border border-nex-purple/30 flex items-center justify-center text-xs font-black text-nex-purple">
                                    {(m.athlete_name || '?').charAt(0)}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-black text-sm tracking-tight">{m.athlete_name}</div>
                                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                        <span className={cn("text-xs font-bold", PLAN_COLOR[m.plan_name] ?? 'text-nex-muted')}>{m.plan_name}</span>
                                        <span className="text-[10px] text-nex-muted">${(m.price || 0).toLocaleString('es-CL')}/mes</span>
                                        <span className="text-[10px] text-nex-muted flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Vence {formatDate(m.expires_at)}
                                        </span>
                                        {isExpiring && (
                                            <span className="text-[10px] text-yellow-400 font-bold">⚠ {days}d restantes</span>
                                        )}
                                    </div>
                                </div>

                                {/* Status badge */}
                                <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold", cfg.bg, cfg.color)}>
                                    <Icon className="w-3 h-3" />
                                    {cfg.label}
                                </div>

                                {/* Actions */}
                                {m.status === 'active' && (
                                    <button onClick={() => updateStatus(m.id, 'suspended')}
                                        className="text-[10px] font-bold text-yellow-400 hover:text-yellow-300 transition-colors px-2">
                                        Suspender
                                    </button>
                                )}
                                {m.status === 'suspended' && (
                                    <button onClick={() => updateStatus(m.id, 'active')}
                                        className="text-[10px] font-bold text-nex-neon hover:text-nex-neon/80 transition-colors px-2">
                                        Reactivar
                                    </button>
                                )}
                            </div>
                        )
                    })}

                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-nex-muted text-sm">
                            No hay membresías en este estado.
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <NewMembershipModal plans={plans} onClose={() => setShowModal(false)} onCreate={handleCreate} />
            )}
        </div>
    )
}
