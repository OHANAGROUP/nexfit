'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MOCK_ATHLETES, MOCK_ROUTINES, MOCK_MEALS, MOCK_MARKET, MOCK_BIOMETRICS } from './data'

export function useAuth() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getSession().then(({ data: { session } }: any) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    return { user, loading }
}

export function useAthletes() {
    const [athletes, setAthletes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isMock, setIsMock] = useState(false)

    useEffect(() => {
        async function fetchAthletes() {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'member')

                if (!error && data && data.length > 0) {
                    setAthletes(data)
                    setIsMock(false)
                } else {
                    setAthletes(MOCK_ATHLETES)
                    setIsMock(true)
                }
            } catch (err) {
                setIsMock(true)
                setAthletes(MOCK_ATHLETES)
            } finally {
                setLoading(false)
            }
        }

        fetchAthletes()
    }, [])

    return { athletes, loading, isMock }
}

export function useRoutine(athleteId: string | undefined) {
    const [routine, setRoutine] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isMock, setIsMock] = useState(false)

    useEffect(() => {
        async function fetchRoutine() {
            if (!athleteId || athleteId === '1') {
                setRoutine(MOCK_ROUTINES.filter(r => r.user_id === '1'))
                setIsMock(true)
                setLoading(false)
                return
            }

            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('activity_logs')
                    .select('*, exercises(*)')
                    .eq('user_id', athleteId)

                if (!error && data && data.length > 0) {
                    setRoutine(data)
                    setIsMock(false)
                } else {
                    setRoutine(MOCK_ROUTINES.filter(r => r.user_id === '1'))
                    setIsMock(true)
                }
            } catch (err) {
                setRoutine(MOCK_ROUTINES.filter(r => r.user_id === '1'))
                setIsMock(true)
            } finally {
                setLoading(false)
            }
        }

        fetchRoutine()
    }, [athleteId])

    return { routine, loading, isMock }
}

export function useNutrition(userId: string | undefined) {
    const [meals, setMeals] = useState<any[]>([])
    const [marketItems, setMarketItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isMock, setIsMock] = useState(false)

    useEffect(() => {
        async function fetchData() {
            if (!userId || userId === '1') {
                setMeals(MOCK_MEALS)
                setMarketItems(MOCK_MARKET.map((item: any) => ({
                    ...item,
                    item: item.item_name,
                    checked: item.is_checked
                })))
                setIsMock(true)
                setLoading(false)
                return
            }

            try {
                const supabase = createClient()

                const { data: mealsData } = await supabase
                    .from('meals')
                    .select('*')
                    .eq('user_id', userId)

                const { data: marketData } = await supabase
                    .from('market_items')
                    .select('*')
                    .eq('user_id', userId)

                let mockActive = false;
                if (mealsData && mealsData.length > 0) {
                    setMeals(mealsData)
                } else {
                    setMeals(MOCK_MEALS)
                    mockActive = true
                }

                if (marketData && marketData.length > 0) {
                    setMarketItems(marketData.map((item: any) => ({
                        ...item,
                        item: item.item_name,
                        checked: item.is_checked
                    })))
                } else {
                    setMarketItems(MOCK_MARKET.map((item: any) => ({
                        ...item,
                        item: item.item_name,
                        checked: item.is_checked
                    })))
                    mockActive = true
                }
                setIsMock(mockActive)
            } catch (err) {
                setIsMock(true)
                setMeals(MOCK_MEALS)
                setMarketItems(MOCK_MARKET.map((item: any) => ({
                    ...item,
                    item: item.item_name,
                    checked: item.is_checked
                })))
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [userId])

    return { meals, marketItems, loading, isMock }
}

export function useTracking(userId: string | undefined) {
    const [biometrics, setBiometrics] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isMock, setIsMock] = useState(false)

    useEffect(() => {
        async function fetchBiometrics() {
            if (!userId || userId === '1') {
                setBiometrics(MOCK_BIOMETRICS)
                setIsMock(true)
                setLoading(false)
                return
            }

            try {
                const supabase = createClient()
                const { data } = await supabase
                    .from('biometrics')
                    .select('*')
                    .eq('user_id', userId)
                    .order('logged_date', { ascending: true })

                if (data && data.length > 0) {
                    setBiometrics(data)
                    setIsMock(false)
                } else {
                    setBiometrics(MOCK_BIOMETRICS)
                    setIsMock(true)
                }
            } catch (err) {
                setBiometrics(MOCK_BIOMETRICS)
                setIsMock(true)
            } finally {
                setLoading(false)
            }
        }

        fetchBiometrics()
    }, [userId])

    return { biometrics, loading, isMock }
}

// ============================================
// PHASE 2: ROUTINE TEMPLATES & ONBOARDING
// ============================================

export function useTemplates() {
    const [templates, setTemplates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isMock, setIsMock] = useState(false)

    useEffect(() => {
        async function fetchTemplates() {
            try {
                const supabase = createClient()
                const { data, error } = await (supabase as any)
                    .from('routine_templates')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (error || !data) {
                    const { MOCK_TEMPLATES } = await import('./data')
                    setTemplates(MOCK_TEMPLATES)
                    setIsMock(true)
                } else {
                    setTemplates(data)
                }
            } catch {
                const { MOCK_TEMPLATES } = await import('./data')
                setTemplates(MOCK_TEMPLATES)
                setIsMock(true)
            } finally {
                setLoading(false)
            }
        }
        fetchTemplates()
    }, [])

    return { templates, loading, isMock }
}

export function useCalendar(userId?: string) {
    const [schedule, setSchedule] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isMock, setIsMock] = useState(false)

    useEffect(() => {
        if (!userId) { setLoading(false); return }
        async function fetchSchedule() {
            try {
                const supabase = createClient()
                const { data, error } = await (supabase as any)
                    .from('training_schedule')
                    .select('*, routine_templates(name, exercises)')
                    .eq('user_id', userId)
                    .order('scheduled_for', { ascending: true })

                if (error || !data || data.length === 0) {
                    const { MOCK_SCHEDULE } = await import('./data')
                    setSchedule(MOCK_SCHEDULE)
                    setIsMock(true)
                } else {
                    setSchedule(data)
                }
            } catch {
                const { MOCK_SCHEDULE } = await import('./data')
                setSchedule(MOCK_SCHEDULE)
                setIsMock(true)
            } finally {
                setLoading(false)
            }
        }
        fetchSchedule()
    }, [userId])

    return { schedule, loading, isMock }
}

export function useOnboarding(userId?: string) {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) { setLoading(false); return }
        async function fetchOnboarding() {
            try {
                const supabase = createClient()
                const { data } = await (supabase as any)
                    .from('onboarding_profiles')
                    .select('*')
                    .eq('user_id', userId)
                    .single()
                setProfile(data)
            } catch {
                setProfile(null)
            } finally {
                setLoading(false)
            }
        }
        fetchOnboarding()
    }, [userId])

    return { profile, loading }
}

// ============================================
// PHASE 3: ANALYTICS & NOTIFICATIONS
// ============================================

export function useAnalytics() {
    const [analytics, setAnalytics] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isMock, setIsMock] = useState(false)

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const supabase = createClient()
                const { data: leaderboard, error } = await (supabase as any)
                    .from('athlete_stats')
                    .select('*')
                    .order('adherence_pct', { ascending: false })

                if (error || !leaderboard || leaderboard.length === 0) {
                    const { MOCK_ANALYTICS } = await import('./data')
                    setAnalytics(MOCK_ANALYTICS)
                    setIsMock(true)
                } else {
                    const { MOCK_ANALYTICS } = await import('./data')
                    setAnalytics({ ...MOCK_ANALYTICS, athlete_leaderboard: leaderboard })
                }
            } catch {
                const { MOCK_ANALYTICS } = await import('./data')
                setAnalytics(MOCK_ANALYTICS)
                setIsMock(true)
            } finally {
                setLoading(false)
            }
        }
        fetchAnalytics()
    }, [])

    return { analytics, loading, isMock }
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isMock, setIsMock] = useState(false)

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const supabase = createClient()
                const { data, error } = await (supabase as any)
                    .from('notifications')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (error || !data || data.length === 0) {
                    const { MOCK_NOTIFICATIONS } = await import('./data')
                    setNotifications(MOCK_NOTIFICATIONS)
                    setIsMock(true)
                } else {
                    setNotifications(data)
                }
            } catch {
                const { MOCK_NOTIFICATIONS } = await import('./data')
                setNotifications(MOCK_NOTIFICATIONS)
                setIsMock(true)
            } finally {
                setLoading(false)
            }
        }
        fetchNotifications()
    }, [])

    const markRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        try {
            const supabase = createClient()
            await (supabase as any).from('notifications').update({ is_read: true }).eq('id', id)
        } catch { /* resilient */ }
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    return { notifications, loading, isMock, markRead, unreadCount }
}

// ============================================
// PHASE 4: MEMBERSHIPS
// ============================================

export function useMembershipPlans() {
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPlans() {
            try {
                const supabase = createClient()
                const { data, error } = await (supabase as any)
                    .from('membership_plans')
                    .select('*')
                    .eq('is_active', true)
                    .order('price', { ascending: true })

                if (error || !data || data.length === 0) {
                    const { MOCK_PLANS } = await import('./data')
                    setPlans(MOCK_PLANS)
                } else {
                    setPlans(data)
                }
            } catch {
                const { MOCK_PLANS } = await import('./data')
                setPlans(MOCK_PLANS)
            } finally {
                setLoading(false)
            }
        }
        fetchPlans()
    }, [])

    return { plans, loading }
}

export function useMemberships(athleteId?: string) {
    const [memberships, setMemberships] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isMock, setIsMock] = useState(false)

    const fetchMemberships = async () => {
        try {
            const supabase = createClient()
            let query = (supabase as any)
                .from('memberships')
                .select('*, membership_plans(name, price), profiles(full_name)')
                .order('expires_at', { ascending: true })

            if (athleteId) query = query.eq('user_id', athleteId)

            const { data, error } = await query

            if (error || !data || data.length === 0) {
                const { MOCK_MEMBERSHIPS } = await import('./data')
                setMemberships(athleteId
                    ? MOCK_MEMBERSHIPS.filter((m: any) => m.user_id === athleteId)
                    : MOCK_MEMBERSHIPS)
                setIsMock(true)
            } else {
                setMemberships(data.map((m: any) => ({
                    ...m,
                    athlete_name: m.profiles?.full_name ?? 'Atleta',
                    plan_name: m.membership_plans?.name ?? '—',
                    price: m.membership_plans?.price ?? 0,
                })))
            }
        } catch {
            const { MOCK_MEMBERSHIPS } = await import('./data')
            setMemberships(MOCK_MEMBERSHIPS)
            setIsMock(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchMemberships() }, [athleteId])

    const createMembership = async (payload: {
        user_id: string; plan_id: string; starts_at: string; expires_at: string; notes?: string
    }) => {
        try {
            const supabase = createClient()
            // Fetch creator's tenant_id to persist
            const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', payload.user_id).single()

            await (supabase as any).from('memberships').insert({
                ...payload,
                tenant_id: profile?.tenant_id,
                status: 'active',
            })
            await fetchMemberships()
        } catch { /* resilient */ }
    }

    const updateStatus = async (id: string, status: string) => {
        setMemberships(prev => prev.map(m => m.id === id ? { ...m, status } : m))
        try {
            const supabase = createClient()
            await (supabase as any).from('memberships').update({ status }).eq('id', id)
        } catch { /* resilient */ }
    }

    const expiringCount = memberships.filter((m: any) => {
        if (m.status !== 'active') return false
        const daysLeft = Math.ceil((new Date(m.expires_at).getTime() - Date.now()) / 86400000)
        return daysLeft <= 7 && daysLeft >= 0
    }).length

    const activeCount = memberships.filter((m: any) => m.status === 'active').length
    const monthlyRevenue = memberships
        .filter((m: any) => m.status === 'active')
        .reduce((sum: number, m: any) => sum + (m.price || 0), 0)

    return { memberships, loading, isMock, createMembership, updateStatus, expiringCount, activeCount, monthlyRevenue }
}

