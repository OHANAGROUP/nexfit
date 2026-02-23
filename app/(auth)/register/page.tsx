'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, User, Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
    const router = useRouter()
    const [type, setType] = useState<'gym' | 'individual'>('individual')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const supabase = createClient()
        const { error: signUpError, data } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    type: type
                }
            }
        })

        if (signUpError) {
            setError(signUpError.message)
            setLoading(false)
        } else {
            // Note: In production you might want to redirect to a verification page
            // but for default Supabase setup it might auto-confirm or just redirect
            router.push('/dashboard')
            router.refresh()
        }
    }

    return (
        <div className="glass-card p-10 border-white/10">
            <h2 className="text-2xl font-black font-rajdhani uppercase italic mb-8 text-center tracking-tight">
                Registro <span className="text-nex-neon">Multitenant</span>
            </h2>

            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl mb-8">
                <button
                    onClick={() => setType('individual')}
                    className={cn(
                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                        type === 'individual' ? "bg-nex-purple text-white shadow-purple-glow" : "text-nex-muted hover:text-white"
                    )}
                >
                    <User className="w-4 h-4" /> Atleta
                </button>
                <button
                    onClick={() => setType('gym')}
                    className={cn(
                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                        type === 'gym' ? "bg-nex-neon text-black shadow-neon-glow" : "text-nex-muted hover:text-white"
                    )}
                >
                    <Building2 className="w-4 h-4" /> Centro / Gym
                </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-[10px] font-bold text-red-400 uppercase tracking-widest text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-nex-muted uppercase tracking-widest ml-1">
                        {type === 'gym' ? 'Nombre del Centro' : 'Identidad Completa'}
                    </label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nex-muted" />
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder={type === 'gym' ? 'Mavi Performance Lab' : 'Alex Rivera'}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-sm font-bold text-nex-white outline-none focus:border-nex-neon transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-nex-muted uppercase tracking-widest ml-1">Email de Enlace</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nex-muted" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="enlace@bio-sync.net"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-sm font-bold text-nex-white outline-none focus:border-nex-neon transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-nex-muted uppercase tracking-widest ml-1">Código de Seguridad</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nex-muted" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-sm font-bold text-nex-white outline-none focus:border-nex-neon transition-all"
                        />
                    </div>
                </div>

                <button
                    disabled={loading}
                    className={cn(
                        "w-full py-4 rounded-2xl font-black uppercase font-rajdhani text-lg tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3",
                        type === 'gym' ? "bg-nex-neon text-black" : "bg-nex-purple text-white",
                        loading && "opacity-50"
                    )}
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>{type === 'gym' ? 'Desplegar Centro' : 'Activar Bio-Sync'} <ShieldCheck className="w-5 h-5" /></>
                    )}
                </button>
            </form>

            <p className="mt-8 text-center text-xs text-nex-muted font-bold uppercase tracking-widest">
                ¿Ya eres parte del núcleo? <Link href="/login" className="text-nex-purple hover:underline">Acceso VIP</Link>
            </p>
        </div>
    )
}
