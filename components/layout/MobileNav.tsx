'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    CreditCard,
    Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileItems = [
    { icon: LayoutDashboard, label: 'Dash', href: '/dashboard' },
    { icon: CalendarDays, label: 'Cal', href: '/calendario' },
    { icon: Users, label: 'Direct', href: '/directorio' },
    { icon: CreditCard, label: 'Memb', href: '/membresias' },
]

export function MobileNav() {
    const pathname = usePathname()

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-nex-black via-nex-black/95 to-transparent">
            <div className="glass-card flex items-center justify-around py-2 px-2 rounded-2xl border-white/10 shadow-2xl relative">
                {/* Floating Mavi Trigger - Visual Indicator */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                    <div className="w-12 h-12 rounded-full bg-nex-purple shadow-purple-glow flex items-center justify-center border-2 border-nex-neon animate-bounce-subtle">
                        <Sparkles className="w-6 h-6 text-nex-neon" />
                    </div>
                </div>

                {mobileItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                                isActive ? "text-nex-neon scale-110" : "text-nex-muted"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", isActive ? "drop-shadow-neon" : "")} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
