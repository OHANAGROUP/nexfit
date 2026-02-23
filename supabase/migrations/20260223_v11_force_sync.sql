-- ============================================================
-- NEXFIT v3.11.1 — EMERGENCY FORCE SYNC
-- Resolve persistent 404 errors for 'notifications' and 'training_schedule'
-- ============================================================

-- 0. CLEANUP (Ensuring no ghost references)
-- (We use IF NOT EXISTS for safety)

-- 1. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type          TEXT NOT NULL,
    title         TEXT NOT NULL,
    message       TEXT NOT NULL,
    severity      TEXT DEFAULT 'info',
    is_read       BOOLEAN DEFAULT false,
    channel       TEXT DEFAULT 'in_app',
    metadata      JSONB,
    dedup_key     TEXT UNIQUE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TRAINING SCHEDULE TABLE
CREATE TABLE IF NOT EXISTS public.training_schedule (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    template_id   UUID, -- Manual link or template
    scheduled_for DATE NOT NULL,
    day_name      TEXT,
    status        TEXT DEFAULT 'planned',
    rpe           NUMERIC,
    notes         TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENABLE RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_schedule ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES (Simplified for recovery)
DROP POLICY IF EXISTS "notifications_isolation" ON public.notifications;
CREATE POLICY "notifications_isolation" ON public.notifications
    FOR ALL USING (user_id = auth.uid() OR tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "schedule_isolation" ON public.training_schedule;
CREATE POLICY "schedule_isolation" ON public.training_schedule
    FOR ALL USING (user_id = auth.uid() OR tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- 5. RE-ASSERT PERMISSIONS
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO anon;
GRANT ALL ON public.training_schedule TO authenticated;
GRANT ALL ON public.training_schedule TO anon;

-- NOTE: If 404 persists, go to Supabase Dashboard -> API -> Settings 
-- and verify that 'public' is in the 'Exposed schemas' list.
