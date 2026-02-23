'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, LogIn, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const supabase = createClient()
        const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (loginError) {
            setError(loginError.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
            router.refresh()
        }
    }

    return (
        <div className="glass-card p-10 border-white/10">
            <h2 className="text-2xl font-black font-rajdhani uppercase italic mb-8 text-center tracking-tight">
                Acceso al <span className="text-nex-purple">Núcleo</span>
            </h2>

            <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-[10px] font-bold text-red-400 uppercase tracking-widest text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-nex-muted uppercase tracking-widest ml-1">ID de Enlace (Email)</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nex-muted" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nombre@bio-performance.com"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-sm font-bold text-nex-white outline-none focus:border-nex-purple transition-all"
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
                            autoComplete="current-password"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-sm font-bold text-nex-white outline-none focus:border-nex-purple transition-all"
                        />
                    </div>
                </div>

                <button
                    disabled={loading}
                    className="w-full bg-nex-white text-nex-black py-4 rounded-2xl font-black uppercase font-rajdhani text-lg tracking-widest hover:bg-nex-neon transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sincronizar <LogIn className="w-5 h-5" /></>}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-4">
                <p className="text-xs text-nex-muted font-bold uppercase tracking-widest">
                    ¿No tienes acceso? <Link href="/register" className="text-nex-neon hover:underline">Saca tu Membresía</Link>
                </p>
                <button className="text-[10px] text-nex-muted hover:text-nex-purple font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto">
                    Recuperar Permisos de Bio-Sync <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    )
}
