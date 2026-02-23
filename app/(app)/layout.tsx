'use client'

import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { ResilienceBanner } from "@/components/ui/ResilienceBanner";
import { MaviCoach } from "@/components/layout/MaviCoach";
import { useAnalytics, useMemberships, useNotifications } from "@/lib/supabase/hooks";
import { usePeriodization } from "@/lib/supabase/periodization";
import type { AnalyticsContext } from "@/lib/mavicoach/insights";

function AppLayoutInner({ children }: { children: React.ReactNode }) {
    const { analytics } = useAnalytics()
    const { activeCount, expiringCount, monthlyRevenue } = useMemberships()
    const { unreadCount } = useNotifications()
    const { activeMesocycle, getVolumeByMuscle, phases } = usePeriodization()

    const ctx: AnalyticsContext | null = analytics ? {
        adherence_avg: analytics.summary?.adherence_avg ?? 0,
        sessions_done: analytics.summary?.sessions_done ?? 0,
        streak_max: analytics.summary?.streak_max ?? 0,
        alerts_pending: analytics.summary?.alerts_pending ?? 0,
        athlete_leaderboard: analytics.athlete_leaderboard ?? [],
        expiring_memberships: expiringCount,
        active_memberships: activeCount,
        monthly_revenue: monthlyRevenue,
        unread_notifications: unreadCount,
        current_mesocycle: activeMesocycle ? {
            name: activeMesocycle.name,
            weekNumber: 2, // Mock current week
            totalWeeks: phases.length,
            goal: activeMesocycle.goal
        } : undefined,
        muscle_volume: getVolumeByMuscle()
    } : null

    return (
        <div className="flex min-h-screen bg-nex-black text-nex-white">
            <Sidebar />
            <div className="flex-1 flex flex-col md:ml-64 pb-24 md:pb-0">
                <ResilienceBanner />
                <main className="flex-1 p-6 md:p-12 animate-in fade-in duration-700">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
            <MaviCoach analyticsContext={ctx} />
            <MobileNav />
        </div>
    )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return <AppLayoutInner>{children}</AppLayoutInner>
}
