'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import {
    buildContextPhrase,
    getInsight,
    QUICK_QUESTIONS,
    type AnalyticsContext
} from '@/lib/mavicoach/insights'
import { X, Send, MessageSquare, Sparkles } from 'lucide-react'

interface MaviCoachProps {
    analyticsContext?: AnalyticsContext | null
}

function formatResponse(text: string) {
    // Convert **bold** to <strong> and newlines to <br>
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-nex-neon">{part.slice(2, -2)}</strong>
        }
        return <span key={i}>{part}</span>
    })
}

function ChatPanel({ ctx, onClose }: { ctx: AnalyticsContext; onClose: () => void }) {
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'mavi'; text: string }>>([
        { role: 'mavi', text: `¡Hola! Soy **Mavi Coach AI** 🤖\n\nTengo acceso completo a los datos del equipo. ¿Qué querés saber?\n\nAdherencia actual: **${ctx.adherence_avg}%** | Membresías activas: **${ctx.active_memberships}**` }
    ])
    const [input, setInput] = useState('')
    const [typing, setTyping] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    const sendMessage = useCallback((query: string) => {
        if (!query.trim()) return
        const userMsg = { role: 'user' as const, text: query }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setTyping(true)

        // Simulate typing delay for realism
        setTimeout(() => {
            const response = getInsight(query, ctx)
            setMessages(prev => [...prev, { role: 'mavi', text: response }])
            setTyping(false)
        }, 600)
    }, [ctx])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, typing])

    return (
        <div className="fixed bottom-28 right-6 z-50 w-[340px] max-h-[500px] glass-card border border-nex-purple/30 rounded-2xl flex flex-col shadow-purple-glow overflow-hidden"
            style={{ background: 'rgba(10,10,20,0.97)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-nex-neon" />
                    <span className="font-black italic tracking-tighter text-sm">MAVI COACH <span className="text-nex-neon">AI</span></span>
                    <span className="px-1.5 py-0.5 rounded bg-nex-neon/20 text-nex-neon text-[8px] font-black uppercase tracking-widest">LIVE DATA</span>
                </div>
                <button onClick={onClose} className="text-nex-muted hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 max-h-72">
                {messages.map((msg, i) => (
                    <div key={i} className={cn(
                        "flex",
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}>
                        <div className={cn(
                            "max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                            msg.role === 'user'
                                ? 'bg-nex-purple text-white rounded-br-sm'
                                : 'bg-white/5 border border-white/10 text-nex-white rounded-bl-sm'
                        )}>
                            {msg.text.split('\n').map((line, li) => (
                                <div key={li}>{formatResponse(line)}</div>
                            ))}
                        </div>
                    </div>
                ))}
                {typing && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/10 rounded-xl rounded-bl-sm px-3 py-2">
                            <div className="flex gap-1 items-center h-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-nex-purple animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-nex-purple animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-nex-purple animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Quick Questions */}
            <div className="px-3 pb-2">
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {QUICK_QUESTIONS.slice(0, 4).map((q) => (
                        <button key={q}
                            onClick={() => sendMessage(q)}
                            disabled={typing}
                            className="shrink-0 px-2.5 py-1 rounded-full border border-nex-purple/30 text-nex-muted hover:text-nex-white hover:border-nex-purple/60 hover:bg-nex-purple/10 transition-all text-[9px] font-bold uppercase tracking-wider whitespace-nowrap disabled:opacity-50">
                            {q.replace('¿', '').replace('?', '')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 pb-3">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                    placeholder="Preguntale a Mavi..."
                    disabled={typing}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-nex-white placeholder-nex-muted focus:outline-none focus:border-nex-purple/50 disabled:opacity-50"
                />
                <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || typing}
                    className="p-2 rounded-xl bg-nex-purple text-white hover:bg-nex-purple/80 disabled:opacity-40 transition-all">
                    <Send className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}

export function MaviCoach({ analyticsContext }: MaviCoachProps) {
    const [state, setState] = useState<'IDLE' | 'WALKING' | 'SLEEPING' | 'ANGRY' | 'POINTING'>('WALKING')
    const [phrase, setPhrase] = useState('')
    const [showBubble, setShowBubble] = useState(false)
    const [walkFrame, setWalkFrame] = useState(1)
    const [direction, setDirection] = useState(1)
    const [currentX, setCurrentX] = useState(300)
    const [showChat, setShowChat] = useState(false)

    const talk = useCallback((msg?: string) => {
        const text = msg || (analyticsContext
            ? buildContextPhrase(analyticsContext)
            : '¡A TRABAJAR! El rendimiento no se hace solo.')
        setPhrase(text)
        setShowBubble(true)
        setTimeout(() => setShowBubble(false), 4000)
    }, [analyticsContext])

    // Walk animation
    useEffect(() => {
        const interval = setInterval(() => {
            if (state === 'WALKING') {
                setWalkFrame(prev => (prev % 4) + 1)
                setCurrentX(prev => {
                    const next = prev + direction * 1.5
                    if (next > window.innerWidth - 100) setDirection(-1)
                    if (next < 60) setDirection(1)
                    return next
                })
            }
        }, 250)
        return () => clearInterval(interval)
    }, [state, direction])

    // Periodic context-aware phrase
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (Math.random() < 0.35 && !showChat) talk()
        }, 5000 + Math.random() * 8000)
        return () => clearTimeout(timeout)
    }, [talk, showChat])

    // Immediately greet with context when analytics loads
    useEffect(() => {
        if (analyticsContext && !showBubble) {
            const t = setTimeout(() => talk(), 1500)
            return () => clearTimeout(t)
        }
    }, [analyticsContext]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleClick = () => {
        if (showChat) {
            setShowChat(false)
            return
        }
        setState('POINTING')
        setShowChat(true)
        setTimeout(() => setState('WALKING'), 2000)
    }

    return (
        <>
            {/* Chat Panel */}
            {showChat && analyticsContext && (
                <ChatPanel ctx={analyticsContext} onClose={() => setShowChat(false)} />
            )}

            {/* Floating chat button when no context yet */}
            {showChat && !analyticsContext && (
                <div className="fixed bottom-28 right-6 z-50 glass-card p-4 rounded-2xl border border-nex-purple/30 text-sm text-nex-muted">
                    Cargando datos del equipo...
                </div>
            )}

            {/* Sprite */}
            <div
                className="fixed bottom-10 z-50 transition-all duration-100 ease-linear"
                style={{ left: currentX }}
            >
                {/* Bubble */}
                <div className={cn("boss-bubble", showBubble && "show")}>
                    {phrase}
                </div>

                {/* Chat indicator */}
                {!showChat && analyticsContext && (
                    <div className="absolute -top-2 -right-1 w-5 h-5 rounded-full bg-nex-neon flex items-center justify-center animate-pulse cursor-pointer pointer-events-auto"
                        onClick={handleClick}>
                        <MessageSquare className="w-2.5 h-2.5 text-black" />
                    </div>
                )}

                {/* Sprite */}
                <div
                    className={cn(
                        "mavi-coach-sprite pointer-events-auto cursor-pointer",
                        state === 'WALKING' ? `don_frame_walk_${walkFrame}` : '',
                        state === 'SLEEPING' ? 'don_frame_sleep_1' : '',
                        state === 'ANGRY' ? 'don_frame_angry boss-angry-shake' : '',
                        state === 'POINTING' ? 'don_frame_point' : '',
                        direction === -1 && 'mirror'
                    )}
                    onClick={handleClick}
                    title="Mavi Coach AI — Click para analizar datos"
                />
            </div>
        </>
    )
}
