'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

const PHRASES = [
    "¡Dale duro! ¡Esa sentadilla no se va a hacer sola!",
    "¿Ya revisaste tus bio-marcas? ¡El progreso no espera!",
    "¡Sin excusas! El rendimiento es lo primero.",
    "¿Cardio hoy? ¡A mover esas piernas!",
    "¡Mantente hidratado! Tu cuerpo te lo agradecerá.",
    "¡Protocolo cargado! Sigue el plan al pie de la letra.",
]

export function MaviCoach() {
    const [state, setState] = useState<'IDLE' | 'WALKING' | 'SLEEPING' | 'ANGRY' | 'POINTING'>('WALKING')
    const [phrase, setPhrase] = useState('')
    const [showBubble, setShowBubble] = useState(false)
    const [walkFrame, setWalkFrame] = useState(1)
    const [direction, setDirection] = useState(1)
    const [currentX, setCurrentX] = useState(300)

    const talk = useCallback((msg?: string) => {
        const text = msg || PHRASES[Math.floor(Math.random() * PHRASES.length)]
        setPhrase(text)
        setShowBubble(true)
        setTimeout(() => setShowBubble(false), 3500)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            if (state === 'WALKING') {
                setWalkFrame(prev => (prev % 4) + 1)
            }
        }, 250)
        return () => clearInterval(interval)
    }, [state])

    useEffect(() => {
        if (Math.random() < 0.1) {
            talk()
        }
    }, [talk])

    return (
        <div
            className="fixed bottom-10 z-50 transition-all duration-100 ease-linear pointer-events-none"
            style={{ left: currentX }}
        >
            <div className={cn(
                "boss-bubble",
                showBubble && "show"
            )}>
                {phrase}
            </div>

            <div
                className={cn(
                    "mavi-coach-sprite pointer-events-auto",
                    state === 'WALKING' ? `don_frame_walk_${walkFrame}` : '',
                    state === 'SLEEPING' ? 'don_frame_sleep_1' : '',
                    state === 'ANGRY' ? 'don_frame_angry boss-angry-shake' : '',
                    state === 'POINTING' ? 'don_frame_point' : '',
                    direction === -1 && 'mirror'
                )}
                onClick={() => {
                    setState('ANGRY')
                    talk("¡A TRABAJAR! ¡NO ME TOQUES!")
                    setTimeout(() => setState('WALKING'), 3000)
                }}
                title="MAVI COACH AI"
            />
        </div>
    )
}
