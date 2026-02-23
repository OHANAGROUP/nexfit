// Supabase Edge Function: auto-notify
// Runs daily via pg_cron or manual invoke
// Detects: inactive athletes, expiring memberships, streak achievements
// Inserts deduplicated notifications into the notifications table

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, serviceRoleKey)

        const today = new Date().toISOString().split('T')[0]
        const results: Record<string, number> = {
            missed_session: 0,
            membership_expiry: 0,
            streak_achieved: 0,
        }

        // ─────────────────────────────────────────────
        // 1. ATHLETES INACTIVE > 7 DAYS → missed_session
        // ─────────────────────────────────────────────
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

        const { data: inactiveAthletes } = await supabase
            .from('training_schedule')
            .select('user_id, tenant_id, profiles!inner(full_name, tenant_id)')
            .lt('scheduled_for', sevenDaysAgo)
            .eq('status', 'planned')
            .order('scheduled_for', { ascending: false })

        const seenInactive = new Set<string>()

        for (const row of (inactiveAthletes ?? [])) {
            const uid = row.user_id
            if (seenInactive.has(uid)) continue
            seenInactive.add(uid)

            const dedupKey = `${uid}_missed_session_${today}`
            const { data: existing } = await supabase
                .from('notifications')
                .select('id')
                .eq('dedup_key', dedupKey)
                .maybeSingle()

            if (existing) continue

            const name = (row.profiles as any)?.full_name ?? 'Atleta'
            await supabase.from('notifications').insert({
                tenant_id: (row.profiles as any)?.tenant_id ?? row.tenant_id,
                user_id: uid,
                type: 'missed_session',
                title: '⚠️ Atleta Inactivo',
                message: `${name} lleva más de 7 días sin completar una sesión. Revisá su plan.`,
                severity: 'warning',
                is_read: false,
                metadata: { detected_at: today },
            })
            results.missed_session++
        }

        // ─────────────────────────────────────────────
        // 2. MEMBERSHIPS EXPIRING ≤ 7 DAYS → membership_expiry
        // ─────────────────────────────────────────────
        const inSevenDays = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

        const { data: expiringMembs } = await supabase
            .from('memberships')
            .select('id, user_id, tenant_id, ends_at, membership_plans(name), profiles!inner(full_name)')
            .eq('status', 'active')
            .gte('ends_at', today)
            .lte('ends_at', inSevenDays)

        for (const memb of (expiringMembs ?? [])) {
            const uid = memb.user_id
            const dedupKey = `${uid}_membership_expiry_${today}`

            const { data: existing } = await supabase
                .from('notifications')
                .select('id')
                .eq('dedup_key', dedupKey)
                .maybeSingle()

            if (existing) continue

            const name = (memb.profiles as any)?.full_name ?? 'Atleta'
            const planName = (memb.membership_plans as any)?.name ?? 'Plan'
            const daysLeft = Math.ceil((new Date(memb.ends_at).getTime() - Date.now()) / 86400000)

            await supabase.from('notifications').insert({
                tenant_id: memb.tenant_id,
                user_id: uid,
                type: 'membership_expiry',
                title: '💳 Membresía por Vencer',
                message: `La membresía "${planName}" de ${name} vence en ${daysLeft} día${daysLeft === 1 ? '' : 's'}. Renovar ahora.`,
                severity: 'warning',
                is_read: false,
                metadata: { ends_at: memb.ends_at, plan: planName, days_left: daysLeft },
            })
            results.membership_expiry++
        }

        // ─────────────────────────────────────────────
        // 3. STREAKS ≥ 7 DAYS → streak_achieved
        // ─────────────────────────────────────────────
        // Uses athlete_stats view + raw check for consecutive done sessions
        const { data: athletes } = await supabase
            .from('athlete_stats')
            .select('user_id, tenant_id, full_name, sessions_done')
            .gte('sessions_done', 7)

        for (const athlete of (athletes ?? [])) {
            const uid = athlete.user_id

            // Check consecutive done sessions from training_schedule
            const { data: sessions } = await supabase
                .from('training_schedule')
                .select('scheduled_for, status')
                .eq('user_id', uid)
                .eq('status', 'done')
                .order('scheduled_for', { ascending: false })
                .limit(14)

            // Calculate current streak
            let streak = 0
            let lastDate: Date | null = null
            for (const s of (sessions ?? [])) {
                const d = new Date(s.scheduled_for)
                if (!lastDate) { streak = 1; lastDate = d; continue }
                const diff = Math.round((lastDate.getTime() - d.getTime()) / 86400000)
                if (diff <= 2) { streak++; lastDate = d } // allow 1 rest day
                else break
            }

            if (streak < 7) continue

            // Only fire on 7-day milestones (7, 14, 21…)
            if (streak % 7 !== 0) continue

            const dedupKey = `${uid}_streak_achieved_${today}`
            const { data: existing } = await supabase
                .from('notifications')
                .select('id')
                .eq('dedup_key', dedupKey)
                .maybeSingle()

            if (existing) continue

            await supabase.from('notifications').insert({
                tenant_id: athlete.tenant_id,
                user_id: uid,
                type: 'streak_achieved',
                title: `🔥 Racha de ${streak} Días`,
                message: `${athlete.full_name ?? 'Atleta'} completó ${streak} sesiones consecutivas. ¡Felicitar!`,
                severity: 'success',
                is_read: false,
                metadata: { streak, detected_at: today },
            })
            results.streak_achieved++
        }

        return new Response(
            JSON.stringify({ ok: true, date: today, inserted: results }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (err) {
        return new Response(
            JSON.stringify({ ok: false, error: String(err) }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
