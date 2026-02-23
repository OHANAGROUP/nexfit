'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Dumbbell,
    Apple,
    TrendingUp,
    Settings,
    LogOut,
    LayoutList,
    CalendarDays,
    BarChart2,
    Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/lib/supabase/hooks'

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Directorio', href: '/directorio' },
    { icon: Dumbbell, label: 'Protocolos', href: '/protocolos' },
    { icon: LayoutList, label: 'Plantillas', href: '/plantillas' },
    { icon: CalendarDays, label: 'Calendario', href: '/calendario' },
    { icon: Apple, label: 'Nutrición', href: '/nutricion' },
    { icon: TrendingUp, label: 'Tracking', href: '/tracking' },
    { icon: BarChart2, label: 'Analytics', href: '/analytics' },
    { icon: Bell, label: 'Alertas', href: '/notificaciones', badge: true },
]


export function Sidebar() {
    const pathname = usePathname()
    const { unreadCount } = useNotifications()

    return (
        <aside className="w-64 h-screen glass-card rounded-none border-y-0 border-l-0 bg-nex-black/60 hidden md:flex flex-col p-6 fixed left-0 top-0 z-40">
            <div className="mb-12 px-2">
                <h2 className="text-3xl font-black italic tracking-tighter">
                    NEX<span className="text-nex-neon">FIT</span>
                </h2>
                <div className="text-[10px] text-nex-muted font-bold tracking-[0.2em] uppercase mt-1">
                    Bio-Core System
                </div>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto">
                {(navItems as any[]).map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    const showBadge = item.badge && unreadCount > 0

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group font-tech text-sm uppercase tracking-widest font-bold",
                                isActive
                                    ? "bg-nex-purple text-white shadow-purple-glow"
                                    : "text-nex-muted hover:text-nex-white hover:bg-white/5"
                            )}
                        >
                            <div className="relative">
                                <Icon className={cn(
                                    "w-5 h-5 transition-transform group-hover:scale-110",
                                    isActive ? "text-nex-neon" : "text-nex-purple"
                                )} />
                                {showBadge && (
                                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-orange-500 text-white text-[8px] font-black flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </div>
                            {item.label}
                        </Link>
                    )
                })}
            </nav>


            <div className="pt-6 border-t border-white/5 space-y-2">
                <Link
                    href="/admin"
                    className="flex items-center gap-4 px-4 py-3 rounded-2xl text-nex-muted hover:text-nex-white hover:bg-white/5 transition-all font-bold text-xs uppercase tracking-widest"
                >
                    <Settings className="w-4 h-4" />
                    Configuración
                </Link>
                <button
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-xs uppercase tracking-widest"
                >
                    <LogOut className="w-4 h-4" />
                    Desconectar
                </button>
            </div>
        </aside>
    )
}
