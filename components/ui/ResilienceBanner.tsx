'use client'
import { useAthletes } from '@/lib/supabase/hooks'

export function ResilienceBanner() {
    const { isMock, loading } = useAthletes()

    if (loading || !isMock) return null

    return (
        <div className="bg-nex-yellow/10 border-b border-nex-yellow/20 py-1.5 px-4 text-center animate-in slide-in-from-top duration-500">
            <span className="text-nex-yellow text-[10px] font-bold uppercase tracking-[0.2em]">
                ⚠️ Modo Resiliente Activo — Mostrando datos de demostración
            </span>
        </div>
    )
}
