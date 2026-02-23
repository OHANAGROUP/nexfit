-- ============================================================
-- NEXFIT v3.10.6 — FULL SCHEMA RECOVERY
-- Restores all missing tables (404 errors) and ensures RLS isolation.
-- ============================================================

-- 0. HELPER (Ensuring existence)
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. BASE MODULE: TRAINING & SCHEDULE (Missing from v4-v9 migrations)
CREATE TABLE IF NOT EXISTS public.routine_templates (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    trainer_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    description   TEXT,
    target_level  TEXT DEFAULT 'all',
    goal_type     TEXT DEFAULT 'general',
    days_per_week INT DEFAULT 3,
    exercises     JSONB DEFAULT '[]',
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.training_schedule (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    template_id   UUID REFERENCES public.routine_templates(id) ON DELETE SET NULL,
    scheduled_for DATE NOT NULL,
    day_name      TEXT,
    status        TEXT DEFAULT 'planned', -- planned, done, skipped
    notes         TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. NOTIFICATIONS RECOVERY (Ensuring 404 resolution)
CREATE TABLE IF NOT EXISTS public.notifications (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type          TEXT NOT NULL, -- missed_session, membership_expiry, streak_achieved
    title         TEXT NOT NULL,
    message       TEXT NOT NULL,
    severity      TEXT DEFAULT 'info',
    is_read       BOOLEAN DEFAULT false,
    channel       TEXT DEFAULT 'in_app',
    metadata      JSONB,
    dedup_key     TEXT UNIQUE,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ADDITIONAL CORE TABLES (Safeguard)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exercise_id   UUID,
    sets          INT,
    reps          INT,
    weight_kg     NUMERIC,
    logged_date   DATE DEFAULT CURRENT_DATE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meals (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name          TEXT NOT NULL,
    time_of_day   TEXT,
    kcal          INT,
    macros        TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.market_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item_name     TEXT NOT NULL,
    category      TEXT,
    is_checked    BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.biometrics (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    metric_type   TEXT NOT NULL,
    value         NUMERIC NOT NULL,
    logged_date   DATE DEFAULT CURRENT_DATE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS POLICIES (Strict Isolation)
ALTER TABLE public.routine_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometrics ENABLE ROW LEVEL SECURITY;

-- Flush old policies to avoid conflicts
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('routine_templates', 'training_schedule', 'notifications', 'activity_logs', 'meals', 'market_items', 'biometrics')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', tbl || '_isolation', tbl);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (tenant_id = get_auth_tenant_id())', tbl || '_isolation', tbl);
    END LOOP;
END $$;

-- Special Read for personal data + gym management
CREATE POLICY "schedule_self_access" ON public.training_schedule FOR ALL USING (user_id = auth.uid() OR tenant_id = get_auth_tenant_id());
CREATE POLICY "notif_self_access" ON public.notifications FOR ALL USING (user_id = auth.uid() OR tenant_id = get_auth_tenant_id());
