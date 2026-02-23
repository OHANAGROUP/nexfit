import { cn } from '@/lib/utils'

interface BentoCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ElementType
    color?: 'purple' | 'neon' | 'lila'
    className?: string
}

export function BentoCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color = 'purple',
    className
}: BentoCardProps) {
    const colors = {
        purple: 'text-nex-purple bg-nex-purple/10 border-nex-purple/20',
        neon: 'text-nex-neon bg-nex-neon/10 border-nex-neon/20',
        lila: 'text-nex-lila bg-nex-lila/10 border-nex-lila/20',
    }

    return (
        <div className={cn("glass-card p-8 group relative overflow-hidden transition-all hover:scale-[1.02]", className)}>
            {/* Glow effect */}
            <div className={cn(
                "absolute -right-4 -top-4 w-24 h-24 blur-[60px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-40",
                color === 'purple' ? 'bg-nex-purple' : color === 'neon' ? 'bg-nex-neon' : 'bg-nex-lila'
            )} />

            <div className="flex justify-between items-start mb-6">
                <div>
                    <span className="text-[10px] font-bold text-nex-muted uppercase tracking-[0.2em] block mb-1">
                        {title}
                    </span>
                    <div className="text-4xl font-black font-rajdhani italic text-nex-white tracking-tighter">
                        {value}
                    </div>
                </div>
                <div className={cn("w-12 h-12 rounded-2xl border flex items-center justify-center transition-transform group-hover:rotate-12", colors[color])}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            {subtitle && (
                <div className="text-[10px] font-bold text-nex-muted uppercase tracking-widest">
                    {subtitle}
                </div>
            )}
        </div>
    )
}
