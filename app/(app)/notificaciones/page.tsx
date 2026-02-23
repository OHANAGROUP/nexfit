'use client'
import { useState } from 'react'
import {
    Bell, CheckCheck, AlertTriangle, Trophy, Zap, BarChart2, Loader2, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/lib/supabase/hooks'

const SEVERITY_CONFIG: Record<string, { icon: any; ring: string; bg: string; dot: string }> = {
    warning: { icon: AlertTriangle, ring: 'border-orange-500/30', bg: 'bg-orange-500/5', dot: 'bg-orange-400' },
    success: { icon: Trophy, ring: 'border-nex-neon/30', bg: 'bg-nex-neon/5', dot: 'bg-nex-neon' },
    info: { icon: BarChart2, ring: 'border-nex-purple/30', bg: 'bg-nex-purple/5', dot: 'bg-nex-purple' },
}

function timeAgo(dateStr: string) {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000 / 60
    if (diff < 60) return `${Math.floor(diff)}m`
    if (diff < 1440) return `${Math.floor(diff / 60)}h`
    return `${Math.floor(diff / 1440)}d`
}

export default function NotificacionesPage() {
    const { notifications, loading, isMock, markRead, unreadCount } = useNotifications()
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    const visible = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-nex-purple animate-spin" />
        </div>
    )

    return (
        <div className="space-y-8 max-w-2xl">
            {/* Header */}
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded bg-nex-purple text-white text-[10px] font-bold uppercase tracking-widest">Sistema</span>
                    {isMock && <span className="px-2 py-0.5 rounded bg-nex-neon/20 border border-nex-neon/30 text-nex-neon text-[10px] font-bold uppercase tracking-widest">Demo Mode</span>}
                    {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded bg-orange-500/20 border border-orange-500/30 text-orange-400 text-[10px] font-bold uppercase tracking-widest">
                            {unreadCount} sin leer
                        </span>
                    )}
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter font-rajdhani">
                    NOTIFI<span className="text-nex-neon">CACIONES</span>
                </h1>
                <p className="text-nex-muted text-sm mt-1">Alertas automáticas generadas por el sistema</p>
            </header>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {(['all', 'unread'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                            filter === f
                                ? "bg-nex-purple text-white"
                                : "border border-white/10 text-nex-muted hover:text-white hover:border-white/30"
                        )}
                    >
                        {f === 'all' ? `Todas (${notifications.length})` : `Sin leer (${unreadCount})`}
                    </button>
                ))}
            </div>

            {/* Feed */}
            <div className="space-y-3">
                {visible.length === 0 && (
                    <div className="glass-card p-8 text-center text-nex-muted">
                        <CheckCheck className="w-10 h-10 mx-auto mb-3 text-nex-neon/40" />
                        <p className="font-bold text-sm uppercase tracking-widest">Todo al día</p>
                    </div>
                )}
                {visible.map(n => {
                    const cfg = SEVERITY_CONFIG[n.severity] || SEVERITY_CONFIG.info
                    const Icon = cfg.icon
                    return (
                        <div
                            key={n.id}
                            className={cn(
                                "glass-card p-4 border transition-all flex items-start gap-4",
                                cfg.ring, cfg.bg,
                                !n.is_read && "shadow-sm"
                            )}
                        >
                            {/* Status dot */}
                            {!n.is_read && (
                                <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", cfg.dot)} />
                            )}

                            {/* Icon */}
                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border", cfg.ring, cfg.bg)}>
                                <Icon className="w-4 h-4" style={{ color: n.severity === 'warning' ? '#fb923c' : n.severity === 'success' ? '#00f5a0' : '#7b2fff' }} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className={cn("font-bold text-sm", n.is_read ? 'text-nex-muted' : 'text-white')}>
                                        {n.title}
                                    </p>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[10px] text-nex-muted font-bold">{timeAgo(n.created_at)}</span>
                                        {!n.is_read && (
                                            <button
                                                onClick={() => markRead(n.id)}
                                                className="text-nex-muted hover:text-white transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-nex-muted text-[12px] mt-0.5 leading-relaxed">{n.message}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
