'use client'

import { cn } from '@/lib/utils'

interface MuscleMapProps {
    muscleGroup: string
    imageUrl?: string
    className?: string
}

const MUSCLE_COLORS: Record<string, string> = {
    'deltoides': '#39ff14',
    'pectoral': '#7b2fff',
    'dorsal': '#c084fc',
    'biceps': '#39ff14',
    'triceps': '#a855f7',
    'cuadriceps': '#39ff14',
    'gluteos': '#7b2fff',
    'isquiotibiales': '#c084fc',
    'abdomen': '#39ff14',
    'lumbar': '#a855f7',
}

export function MuscleMapDisplay({ muscleGroup, imageUrl, className }: MuscleMapProps) {
    const primaryMuscle = muscleGroup.toLowerCase().split('·')[0].trim()
    const highlightColor = MUSCLE_COLORS[primaryMuscle] || '#39ff14'

    return (
        <div className={cn("glass-card overflow-hidden p-6", className)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Exercise Image */}
                <div className="relative rounded-2xl overflow-hidden aspect-video group">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={muscleGroup}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                            <span className="text-nex-muted uppercase text-[10px] font-bold">Sin Imagen Bio-Sync</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-nex-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                        <span
                            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-black"
                            style={{ backgroundColor: highlightColor }}
                        >
                            Target: {muscleGroup}
                        </span>
                    </div>
                </div>

                {/* Anatomical Diagram */}
                <div className="flex flex-col items-center justify-center">
                    <div className="w-48 h-64 relative">
                        <BodyDiagramSVG activeMuscle={primaryMuscle} highlightColor={highlightColor} />
                    </div>
                    <p className="text-[10px] font-bold text-nex-muted uppercase tracking-[0.3em] mt-4">
                        Activación Muscular Detectada
                    </p>
                </div>
            </div>
        </div>
    )
}

function BodyDiagramSVG({ activeMuscle, highlightColor }: { activeMuscle: string, highlightColor: string }) {
    const isActive = (muscle: string) =>
        activeMuscle.includes(muscle) ? highlightColor : 'rgba(123,47,255,0.2)'

    return (
        <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-[0_0_10px_rgba(123,47,255,0.2)]">
            {/* Head */}
            <ellipse cx="100" cy="30" rx="22" ry="26" fill="rgba(240,240,255,0.1)" stroke="rgba(123,47,255,0.4)" strokeWidth="1.5" />
            {/* Shoulders */}
            <ellipse cx="68" cy="78" rx="16" ry="12" fill={isActive('deltoides')} opacity="0.8" />
            <ellipse cx="132" cy="78" rx="16" ry="12" fill={isActive('deltoides')} opacity="0.8" />
            {/* Chest */}
            <rect x="78" y="66" width="44" height="36" rx="6" fill={isActive('pectoral')} opacity="0.85" />
            {/* Abs */}
            <rect x="82" y="102" width="36" height="50" rx="4" fill={isActive('abdomen')} opacity="0.8" />
            {/* Biceps */}
            <rect x="54" y="90" width="12" height="34" rx="6" fill={isActive('biceps')} opacity="0.85" />
            <rect x="134" y="90" width="12" height="34" rx="6" fill={isActive('biceps')} opacity="0.85" />
            {/* Quads */}
            <rect x="78" y="172" width="20" height="55" rx="8" fill={isActive('cuadriceps')} opacity="0.85" />
            <rect x="102" y="172" width="20" height="55" rx="8" fill={isActive('cuadriceps')} opacity="0.85" />

            {/* Pulsing indicator for active target */}
            {activeMuscle && (
                <circle cx="100" cy="120" r="4" fill={highlightColor} className="animate-pulse">
                    <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                </circle>
            )}
        </svg>
    )
}
