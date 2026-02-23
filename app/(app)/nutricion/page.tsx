'use client'

import { useState } from 'react'
import {
    Apple,
    ShoppingCart,
    Plus,
    Check,
    Trash2,
    PieChart,
    Target,
    Clock,
    Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNutrition, useAuth } from '@/lib/supabase/hooks'

export default function NutricionPage() {
    const { user } = useAuth()
    const { meals, marketItems, loading } = useNutrition(user?.id)

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-nex-lila animate-spin" />
                <p className="text-nex-muted font-black uppercase tracking-[0.3em] text-[10px]">Sincronizando Bio-Nutrición...</p>
            </div>
        )
    }

    return (
        <div className="space-y-12">
            {/* Header */}
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded bg-nex-lila text-white text-[10px] font-bold uppercase tracking-widest">
                        Bio-Nutrition
                    </span>
                    <span className="text-[10px] text-nex-muted font-bold uppercase tracking-widest flex items-center gap-1">
                        Optimización Metabólica
                    </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black font-rajdhani uppercase tracking-tighter italic">
                    NUTRITION <span className="text-nex-lila">PLAN</span>
                </h1>
                <div className="flex gap-4 mt-4">
                    <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                        <span className="block text-[8px] text-nex-muted font-bold uppercase">Objetivo Kcal</span>
                        <span className="text-sm font-black font-rajdhani italic text-nex-white">2,850 kcal</span>
                    </div>
                    <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                        <span className="block text-[8px] text-nex-muted font-bold uppercase">Proteína Target</span>
                        <span className="text-sm font-black font-rajdhani italic text-nex-lila">2.2g / kg</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Meals Column */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-nex-muted uppercase tracking-[0.3em] flex items-center gap-2">
                            <Clock className="w-4 h-4 text-nex-lila" /> Cronoconsumo Diario
                        </h3>
                        <button className="text-nex-lila text-[10px] font-bold uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-2">
                            Añadir Ingesta <Plus className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {meals.map((meal) => (
                            <div key={meal.id} className="glass-card p-6 border-white/5 group hover:border-nex-lila/30 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 rounded bg-nex-lila/10 border border-nex-lila/20 text-[9px] font-bold text-nex-lila uppercase tracking-widest">
                                        {meal.time_of_day}
                                    </span>
                                    <span className="font-rajdhani text-xl text-nex-white italic">{meal.kcal} KCAL</span>
                                </div>
                                <h4 className="text-lg font-black font-rajdhani uppercase text-nex-white mb-2 italic">
                                    {meal.name}
                                </h4>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-nex-muted uppercase tracking-widest">
                                        <PieChart className="inline w-3 h-3 mr-1" /> {meal.macros}
                                    </span>
                                    <button className="text-nex-muted hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Market List Column */}
                <div className="space-y-8">
                    <h3 className="text-xs font-black text-nex-muted uppercase tracking-[0.3em] flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-nex-neon" /> Bio-Market List
                    </h3>

                    <div className="glass-card p-8 border-white/5 space-y-6">
                        <div className="flex gap-4 mb-8">
                            <input
                                type="text"
                                placeholder="NUEVO ITEM..."
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-1 text-xs font-bold uppercase text-nex-white outline-none focus:border-nex-neon transition-all"
                            />
                            <button className="bg-nex-neon text-black px-4 py-3 rounded-xl hover:scale-105 transition-all active:scale-95">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {marketItems.map((item: any) => (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border border-white/5 cursor-pointer transition-all",
                                        item.checked ? "bg-white/5 opacity-50" : "bg-white/[0.02] hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-6 h-6 rounded-md border flex items-center justify-center transition-all",
                                            item.checked ? "bg-nex-neon border-nex-neon text-black" : "border-white/10 text-transparent"
                                        )}>
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className={cn(
                                                "text-sm font-bold uppercase tracking-tight",
                                                item.checked && "line-through text-nex-muted"
                                            )}>
                                                {item.item}
                                            </span>
                                            <span className="block text-[8px] text-nex-muted font-black uppercase tracking-widest mt-0.5">
                                                Cat: {item.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <div className="flex items-center justify-between text-nex-muted text-[10px] font-bold uppercase tracking-widest">
                                <span>Items Pendientes: {marketItems.filter((i: any) => !i.checked).length}</span>
                                <button className="hover:text-red-400">Limpiar Seleccionados</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
