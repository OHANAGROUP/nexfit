'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Search,
    UserPlus,
    Dumbbell,
    LineChart,
    Edit3,
    MoreHorizontal,
    ChevronRight,
    Loader2,
    ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAthletes, useAuth } from '@/lib/supabase/hooks'

export default function DirectorioPage() {
    const { user } = useAuth()
    const { athletes, loading, createAthlete } = useAthletes()
    const [searchQuery, setSearchQuery] = useState('')
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
    const [newAthlete, setNewAthlete] = useState({ full_name: '', email: '', goal: '' })
    const [isSaving, setIsSaving] = useState(false)

    const filteredAthletes = athletes.filter(a =>
        a.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.role?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        const { error } = await createAthlete(newAthlete)
        setIsSaving(false)
        if (!error) {
            setIsRegisterModalOpen(false)
            setNewAthlete({ full_name: '', email: '', goal: '' })
        } else {
            alert('Error al registrar atleta: ' + (error as any).message)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-nex-purple animate-spin" />
                <p className="text-nex-muted font-black uppercase tracking-[0.3em] text-[10px]">Sincronizando Bio-Directorio...</p>
            </div>
        )
    }

    return (
        <div className="space-y-12">
            {/* Technical Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 rounded bg-nex-neon text-black text-[10px] font-bold uppercase tracking-widest">
                            Active Directory
                        </span>
                        <span className="text-[10px] text-nex-muted font-bold uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-nex-neon animate-pulse"></span> Network Linked
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black font-rajdhani uppercase tracking-tighter italic">
                        BIO <span className="text-nex-neon">DIRECTORY</span>
                    </h1>
                    <p className="text-nex-muted mt-2 tracking-widest uppercase text-xs font-bold border-l-2 border-nex-purple pl-4">
                        Gestión centralizada de perfiles y biométricos de alto rendimiento.
                    </p>
                </div>
                <button
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="bg-nex-white text-nex-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest font-rajdhani text-lg hover:bg-nex-neon transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-xl"
                >
                    <UserPlus className="w-5 h-5" />
                    Registrar Atleta
                </button>
            </header>

            {/* Filter Bar */}
            <div className="glass-card p-2 rounded-2xl border-white/5 flex items-center px-6 gap-4">
                <Search className="w-5 h-5 text-nex-muted" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="FILTRAR POR NOMBRE, OBJETIVO O BIOMETRICOS..."
                    className="bg-transparent border-none outline-none w-full py-4 text-sm font-bold tracking-widest uppercase text-nex-white placeholder:text-nex-muted/40"
                />
            </div>

            {/* Technical Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                        <tr className="text-[10px] font-bold text-nex-muted uppercase tracking-[0.2em]">
                            <th className="px-8 py-2">Atleta / Identidad</th>
                            <th className="px-8 py-2">Status & Nivel</th>
                            <th className="px-8 py-2">Bio-Métricas</th>
                            <th className="px-8 py-2 text-right">Protocolos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAthletes.map((athlete) => (
                            <tr key={athlete.id} className="group transition-all">
                                <td className="px-8 py-6 glass-card border-none rounded-l-3xl group-hover:bg-white/[0.05]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-nex-purple/20 border border-nex-purple/30 flex items-center justify-center font-rajdhani text-xl text-nex-purple italic">
                                            {athlete.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-xl font-black font-rajdhani uppercase tracking-tight italic group-hover:text-nex-neon transition-colors">
                                                {athlete.full_name}
                                            </div>
                                            <div className="text-[9px] text-nex-muted font-bold uppercase tracking-widest mt-1">
                                                {athlete.email || 'bio-id: ' + athlete.id.slice(0, 8)}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 glass-card border-none group-hover:bg-white/[0.05]">
                                    <div className="inline-flex px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-nex-muted uppercase tracking-widest mb-1">
                                        NIVEL: {athlete.role}
                                    </div>
                                    <div className="text-xs text-nex-purple font-black uppercase tracking-tight italic">
                                        TARGET: {athlete.goal || 'RENDIMIENTO'}
                                    </div>
                                </td>
                                <td className="px-8 py-6 glass-card border-none group-hover:bg-white/[0.05]">
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <span className="block text-[8px] text-nex-muted font-bold uppercase mb-1">Peso</span>
                                            <span className="text-xl font-rajdhani text-nex-white italic">{athlete.weight || 75} kg</span>
                                        </div>
                                        <div className="w-px h-8 bg-white/5"></div>
                                        <div>
                                            <span className="block text-[8px] text-nex-muted font-bold uppercase mb-1">Grasa</span>
                                            <span className="text-xl font-rajdhani text-nex-neon italic">{athlete.fat || 15} %</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-6 md:px-8 glass-card border-none rounded-r-3xl group-hover:bg-white/[0.05] text-right">
                                    <div className="flex justify-end gap-2 md:gap-3 md:opacity-0 md:group-hover:opacity-100 transition-all md:translate-x-4 md:group-hover:translate-x-0">
                                        <Link href={`/progreso/${athlete.id}`} className="w-11 h-11 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/10 text-nex-neon flex items-center justify-center hover:bg-nex-neon hover:text-black transition-all active:scale-90" title="Ver Progreso">
                                            <ImageIcon className="w-5 h-5" />
                                        </Link>
                                        <button className="w-11 h-11 md:w-10 md:h-10 rounded-xl bg-nex-white text-nex-black flex items-center justify-center hover:bg-nex-neon transition-all active:scale-90" title="Ver Protocolos">
                                            <Dumbbell className="w-5 h-5" />
                                        </button>
                                        <button className="w-11 h-11 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-nex-purple transition-all active:scale-90" title="Ver Análisis">
                                            <LineChart className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="md:group-hover:hidden text-nex-muted md:block hidden">
                                        <ChevronRight className="w-5 h-5 ml-auto" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredAthletes.length === 0 && (
                <div className="glass-card p-24 text-center border-dashed border-white/10 opacity-50">
                    <h3 className="text-2xl font-black font-rajdhani uppercase tracking-widest mb-2 italic">Sistema Vacío</h3>
                    <p className="text-nex-muted text-xs uppercase font-bold tracking-widest">No se encontraron unidades con ese parámetro.</p>
                </div>
            )}

            {/* Registration Modal */}
            {isRegisterModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-nex-black/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-lg glass-card p-8 border-white/10 relative overflow-hidden">
                        {/* Technical Background */}
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <UserPlus className="w-32 h-32 text-nex-neon" />
                        </div>

                        <h2 className="text-3xl font-black font-rajdhani uppercase italic mb-8 flex items-center gap-3">
                            Registrar <span className="text-nex-neon">Nueva Bio-Unidad</span>
                        </h2>

                        <form onSubmit={handleRegister} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-nex-muted uppercase tracking-[0.2em] ml-1">Identidad Completa</label>
                                <input
                                    type="text"
                                    required
                                    value={newAthlete.full_name}
                                    onChange={e => setNewAthlete({ ...newAthlete, full_name: e.target.value })}
                                    placeholder="NOMBRE Y APELLIDO..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-nex-white outline-none focus:border-nex-neon transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-nex-muted uppercase tracking-[0.2em] ml-1">Email / Enlace</label>
                                <input
                                    type="email"
                                    value={newAthlete.email}
                                    onChange={e => setNewAthlete({ ...newAthlete, email: e.target.value })}
                                    placeholder="BIO@SYNAPSE.NET (OPCIONAL)..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-nex-white outline-none focus:border-nex-neon transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-nex-muted uppercase tracking-[0.2em] ml-1">Objetivo Metabolic</label>
                                <select
                                    value={newAthlete.goal}
                                    onChange={e => setNewAthlete({ ...newAthlete, goal: e.target.value })}
                                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-nex-white outline-none focus:border-nex-neon transition-all appearance-none"
                                >
                                    <option value="">SELECCIONAR TARGET...</option>
                                    <option value="strength">FUERZA PURA / STRENGTH</option>
                                    <option value="hypertrophy">HIPERTROFIA / MASA</option>
                                    <option value="performance">RENDIMIENTO / PERFORMANCE</option>
                                    <option value="health">SALUD / LONGEVIDAD</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsRegisterModalOpen(false)}
                                    className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-nex-muted border border-white/5 hover:bg-white/5 transition-all text-xs"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-[2] bg-nex-white text-nex-black py-4 rounded-2xl font-black uppercase tracking-widest font-rajdhani text-lg hover:bg-nex-neon transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sincronizar Bio-Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

