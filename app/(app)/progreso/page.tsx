'use client'
import { useAthletes } from '@/lib/supabase/hooks'
import { Camera, Loader2, ImageIcon, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getLocalPhotos } from '@/lib/progressPhotos'

export default function ProgresoPage() {
    const { athletes, loading } = useAthletes()
    const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({})

    useEffect(() => {
        if (!athletes.length) return
        const counts: Record<string, number> = {}
        athletes.forEach((a: any) => {
            counts[a.id] = getLocalPhotos(a.id).length
        })
        setPhotoCounts(counts)
    }, [athletes])

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-nex-purple animate-spin" />
        </div>
    )

    const totalPhotos = Object.values(photoCounts).reduce((a, b) => a + b, 0)

    return (
        <div className="space-y-10">
            {/* Header */}
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded bg-nex-purple text-white text-[10px] font-bold uppercase tracking-widest">Progreso Visual</span>
                    {totalPhotos > 0 && (
                        <span className="px-2 py-0.5 rounded bg-nex-neon/20 border border-nex-neon/30 text-nex-neon text-[10px] font-bold uppercase tracking-widest">
                            {totalPhotos} fotos
                        </span>
                    )}
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter font-rajdhani">
                    FOTO<span className="text-nex-neon">GRAMAS</span>
                </h1>
                <p className="text-nex-muted text-sm mt-1">Timeline fotográfico por atleta — upload, compare y analizá la evolución corporal</p>
            </header>

            {/* Info strip */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-nex-purple/20 bg-nex-purple/5 text-sm">
                <ImageIcon className="w-4 h-4 text-nex-purple mt-0.5 shrink-0" />
                <div className="text-nex-white/80 text-xs">
                    Las fotos se guardan <strong className="text-nex-white">localmente en este dispositivo</strong>. Cuando conectes Supabase Storage, migrarán automáticamente a la nube.
                </div>
            </div>

            {/* Athlete grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {athletes.map((athlete: any) => {
                    const count = photoCounts[athlete.id] ?? 0
                    return (
                        <Link key={athlete.id} href={`/progreso/${athlete.id}`}
                            className="glass-card p-5 flex items-center justify-between group hover:border-nex-purple/40 transition-all">
                            <div className="flex items-center gap-4">
                                {/* Avatar with photo count */}
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-nex-purple/20 border border-nex-purple/30 flex items-center justify-center font-black italic text-xl text-nex-purple font-rajdhani">
                                        {athlete.full_name.charAt(0)}
                                    </div>
                                    {count > 0 && (
                                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-nex-neon text-black text-[9px] font-black flex items-center justify-center">
                                            {count}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <div className="font-black italic tracking-tighter">{athlete.full_name}</div>
                                    <div className="text-[10px] text-nex-muted font-bold mt-0.5">
                                        {count === 0
                                            ? 'Sin fotos aún'
                                            : `${count} foto${count !== 1 ? 's' : ''}`}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-nex-purple group-hover:text-nex-neon transition-colors">
                                {count === 0
                                    ? <Camera className="w-4 h-4" />
                                    : <ImageIcon className="w-4 h-4" />}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
