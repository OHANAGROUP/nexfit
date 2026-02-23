// lib/mavicoach/insights.ts
// Rule-based NLG engine for Mavi Coach AI
// Generates context-aware insights from real analytics data without any external API

export interface AnalyticsContext {
    adherence_avg: number
    sessions_done: number
    streak_max: number
    alerts_pending: number
    athlete_leaderboard: Array<{
        name?: string
        full_name?: string
        adherence_pct: number
        sessions_done: number
        streak?: number
    }>
    expiring_memberships: number
    active_memberships: number
    monthly_revenue: number
    unread_notifications: number
    top_athlete?: string
    bottom_athlete?: string
    current_mesocycle?: {
        name: string
        weekNumber: number
        totalWeeks: number
        goal: string
    }
    muscle_volume?: Array<{ name: string; value: number }>
}

// ─────────────────────────────────────────────────────────
// CONTEXT PHRASE BUILDER — for the walking sprite
// Returns the most relevant phrase for the current state
// ─────────────────────────────────────────────────────────
export function buildContextPhrase(ctx: AnalyticsContext): string {
    const { adherence_avg, streak_max, alerts_pending, expiring_memberships, unread_notifications, current_mesocycle } = ctx

    // Priority order: periodization status, then urgent issues, then celebrations
    if (current_mesocycle) {
        if (current_mesocycle.weekNumber === current_mesocycle.totalWeeks) {
            return `🎯 Semana final del bloque "${current_mesocycle.name}". ¡Preparate para el pico de rendimiento!`
        }
        if (current_mesocycle.goal === 'deload') {
            return `🧘 Semana de descarga activa. Recuperación prioritaria para el siguiente bloque.`
        }
    }
    if (expiring_memberships > 0) {
        return `💳 ${expiring_memberships} membresía${expiring_memberships > 1 ? 's' : ''} vence${expiring_memberships === 1 ? '' : 'n'} esta semana — ¡Renovar ya!`
    }
    if (alerts_pending > 2 || unread_notifications > 3) {
        return `🚨 ${alerts_pending} alertas activas — ¡El equipo necesita atención!`
    }
    if (adherence_avg < 75) {
        return `📉 Adherencia en ${adherence_avg}% — ¡Muy por debajo del objetivo! Revisá los planes.`
    }
    if (adherence_avg < 85) {
        return `📊 Adherencia ${adherence_avg}% — El equipo puede dar más. ¡A motivarlos!`
    }
    if (adherence_avg >= 95) {
        return `🔥 ¡MODO ÉLITE! Adherencia del ${adherence_avg}%. ¡El equipo está imparable!`
    }
    if (streak_max >= 14) {
        return `⚡ Racha de ${streak_max} días activa — ¡Eso es dedicación real! Felicitar ya.`
    }
    if (adherence_avg >= 90) {
        return `✅ Adherencia ${adherence_avg}% — ¡Equipo en modo bestia! Sigan así.`
    }

    // Fallback motivationals with real stat
    const fallbacks = [
        `💪 ${ctx.sessions_done} sesiones completadas este mes. ¡Vamos por más!`,
        `🎯 Meta del equipo: superar ${adherence_avg}% de adherencia esta semana.`,
        `📈 Racha máxima actual: ${streak_max} días. ¿Quién la bate?`,
        `🏋️ ${ctx.active_memberships} atletas activos en el sistema. ¡A por todos!`,
    ]
    return fallbacks[Math.floor(Date.now() / 30000) % fallbacks.length]
}

// ─────────────────────────────────────────────────────────
// NLG INSIGHT ENGINE — for the chat panel
// Detects keywords in query and returns a formatted response
// ─────────────────────────────────────────────────────────
export function getInsight(query: string, ctx: AnalyticsContext): string {
    const q = query.toLowerCase().trim()

    // --- Team summary ---
    if (/equipo|semana|resumen|general|cómo|como|estado/.test(q)) {
        const verdict = ctx.adherence_avg >= 90 ? 'excelente' : ctx.adherence_avg >= 80 ? 'bueno' : 'bajo'
        const icon = ctx.adherence_avg >= 90 ? '🔥' : ctx.adherence_avg >= 80 ? '✅' : '⚠️'
        return `${icon} El rendimiento del equipo está en nivel **${verdict}**:\n\n` +
            `• Adherencia media: **${ctx.adherence_avg}%** ${ctx.adherence_avg >= 90 ? '(sobre objetivo)' : '(bajo objetivo del 90%)'}\n` +
            `• Sesiones completadas: **${ctx.sessions_done}** este mes\n` +
            `• Racha máxima activa: **${ctx.streak_max} días**\n` +
            `• Alertas pendientes: **${ctx.alerts_pending}**\n\n` +
            (ctx.adherence_avg < 80
                ? '⚡ Recomendación: revisá los planes de los atletas con adherencia <70%.'
                : '¡El equipo va por buen camino! Mantené el ritmo.')
    }

    // --- At-risk athletes ---
    if (/atención|urgente|riesgo|peor|bajo|inactiv|alerta/.test(q)) {
        const atRisk = [...ctx.athlete_leaderboard]
            .sort((a, b) => a.adherence_pct - b.adherence_pct)
            .slice(0, 3)

        if (atRisk.length === 0) {
            return '✅ ¡Todos los atletas están al día! No hay casos urgentes esta semana.'
        }

        const list = atRisk.map((a, i) => {
            const name = a.name || a.full_name || 'Atleta'
            const ICON = a.adherence_pct < 60 ? '🔴' : a.adherence_pct < 80 ? '🟡' : '🟢'
            return `${i + 1}. ${ICON} **${name}** — ${a.adherence_pct}% adherencia`
        }).join('\n')

        return `🚨 **Atletas que necesitan atención urgente:**\n\n${list}\n\n` +
            `Contactar y revisar sus planes de entrenamiento cuanto antes.`
    }

    // --- Memberships ---
    if (/membresía|membresia|vence|pago|plan|cobr|renovar/.test(q)) {
        if (ctx.expiring_memberships === 0) {
            return `✅ Ninguna membresía vence en los próximos 7 días.\n\n` +
                `• Membresías activas: **${ctx.active_memberships}**\n` +
                `• Ingreso mensual estimado: **$${ctx.monthly_revenue.toLocaleString('es-CL')}**`
        }
        return `💳 **${ctx.expiring_memberships} membresía${ctx.expiring_memberships > 1 ? 's' : ''}** vence${ctx.expiring_memberships === 1 ? '' : 'n'} en los próximos 7 días.\n\n` +
            `• Ingreso en riesgo: estimado según planes activos\n` +
            `• Membresías activas totales: **${ctx.active_memberships}**\n` +
            `• Ingreso mensual actual: **$${ctx.monthly_revenue.toLocaleString('es-CL')}**\n\n` +
            `📲 Acción: ir a /membresias y contactar a los atletas afectados.`
    }

    // --- Streaks ---
    if (/racha|streak|consecutiv|record|récord/.test(q)) {
        const topStreaker = ctx.athlete_leaderboard
            .filter(a => (a.streak ?? 0) > 0)
            .sort((a, b) => (b.streak ?? 0) - (a.streak ?? 0))[0]

        if (!topStreaker) {
            return `📊 La racha máxima del equipo esta semana es de **${ctx.streak_max} días**.\n\n` +
                `¡Motivá a los atletas a mantener la consistencia!`
        }

        const name = topStreaker.name || topStreaker.full_name || 'Tu mejor atleta'
        return `🔥 **¡Racha máxima del equipo: ${ctx.streak_max} días!**\n\n` +
            `Líder actual: **${name}** con **${topStreaker.streak} sesiones consecutivas**.\n\n` +
            `💡 Felicitalo hoy — el reconocimiento aumenta la retención un 40%.`
    }

    // --- Revenue / Ingreso ---
    if (/ingreso|revenue|dinero|plata|cobro|factur/.test(q)) {
        return `💰 **Resumen financiero del mes:**\n\n` +
            `• Membresías activas: **${ctx.active_memberships}**\n` +
            `• Ingreso mensual: **$${ctx.monthly_revenue.toLocaleString('es-CL')}**\n` +
            `• Membresías por vencer: **${ctx.expiring_memberships}**\n\n` +
            (ctx.expiring_memberships > 0
                ? `⚠️ Renovar las membresías vencientes evitaría perder ingresos potenciales.`
                : `✅ Todos los pagos al día. Buen mes.`)
    }

    // --- Sessions / Training ---
    if (/sesión|sesiones|entrenamiento|training|workout/.test(q)) {
        return `🏋️ **Resumen de sesiones:**\n\n` +
            `• Total completadas: **${ctx.sessions_done}** este mes\n` +
            `• Adherencia media: **${ctx.adherence_avg}%**\n` +
            `• Racha máxima: **${ctx.streak_max} días**\n\n` +
            (ctx.adherence_avg >= 90
                ? `🔥 ¡El equipo está en un nivel excepcional!`
                : `💡 Para llegar al 90%+ necesitás ${Math.ceil((0.9 * (ctx.sessions_done / ctx.adherence_avg * 100)) - ctx.sessions_done)} sesiones más.`)
    }

    // --- Leaderboard / Top ---
    if (/top|mejor|líder|lider|ranking|podio|campeón/.test(q)) {
        const top3 = [...ctx.athlete_leaderboard]
            .sort((a, b) => b.adherence_pct - a.adherence_pct)
            .slice(0, 3)

        const medals = ['🥇', '🥈', '🥉']
        const list = top3.map((a, i) => {
            const name = a.name || a.full_name || 'Atleta'
            return `${medals[i]} **${name}** — ${a.adherence_pct}% adherencia`
        }).join('\n')

        return `🏆 **Top 3 atletas del equipo:**\n\n${list}\n\n¡Reconocer a los líderes motiva a todos!`
    }

    // --- Volume / Periodization ---
    if (/volumen|tonaje|tonelaje|músculo|musculo|carga|mesociclo|bloque/.test(q)) {
        if (ctx.current_mesocycle) {
            const topMuscle = ctx.muscle_volume?.sort((a, b) => b.value - a.value)[0]
            return `📉 **Estado de Planificación:**\n\n` +
                `• Bloque actual: **${ctx.current_mesocycle.name}**\n` +
                `• Semana: **${ctx.current_mesocycle.weekNumber} de ${ctx.current_mesocycle.totalWeeks}** (${ctx.current_mesocycle.goal})\n` +
                (topMuscle
                    ? `• Mayor carga acumulada: **${topMuscle.name}** (${topMuscle.value.toLocaleString()} kg total)\n\n`
                    : '\n') +
                `💡 Sugerencia: mantené los RPE según lo planificado para este bloque de ${ctx.current_mesocycle.goal}.`
        }
        return `📊 Todavía no hay un mesociclo activo definido para este atleta. Definí uno en **/protocolos/mesociclos**.`
    }

    // --- Default / Fallback ---
    return `👋 Hola! Soy **Mavi Coach AI**. Puedo analizar:\n\n` +
        `• **"¿Cómo está el equipo?"** — resumen general\n` +
        `• **"¿Quién necesita atención?"** — atletas en riesgo\n` +
        `• **"¿Qué membresías vencen?"** — estado de pagos\n` +
        `• **"¿Cómo va el volumen?"** — carga por músculo\n` +
        `• **"¿En qué fase estamos?"** — mesociclos y periodización\n\n` +
        `Actualmente: **${ctx.active_memberships}** atletas activos, **${ctx.adherence_avg}%** adherencia media. 💪`
}

// ─────────────────────────────────────────────────────────
// QUICK QUESTIONS — for the chat panel chips
// ─────────────────────────────────────────────────────────
export const QUICK_QUESTIONS = [
    '¿Cómo está el equipo esta semana?',
    '¿Quién necesita atención urgente?',
    '¿Qué membresías vencen pronto?',
    '¿Cuál es la racha más larga?',
    '¿Cómo van los ingresos?',
    '¿Cómo va la distribución de volumen?',
    '¿En qué fase del mesociclo estamos?',
]
