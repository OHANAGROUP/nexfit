-- NEXFIT v3.10.2 — Security Hardening & Multitenant Isolation
-- This script fixes the "true" RLS vulnerability and aligns the schema for multi-gym isolation.

-- 1. TENANT ISOLATION HELPER
-- This function retrieves the tenant_id of the currently authenticated user
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. SCHEMA ALIGNMENT & TENANT_ID INJECTION
-- Align memberships: rename ends_at to expires_at (as requested in diagnostic)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memberships' AND column_name = 'ends_at') THEN
        ALTER TABLE public.memberships RENAME COLUMN ends_at TO expires_at;
    END IF;
END $$;

-- Add tenant_id to tables that lack it
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.mesocycles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.training_phases ADD COLUMN IF NOT EXISTS tenant_id UUID; -- Linked via mesocycle_id usually, but stored for flat RLS efficiency
ALTER TABLE public.set_performance ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.progress_photos ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.membership_plans ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Populate tenant_id for existing records from profiles
UPDATE public.memberships m SET tenant_id = p.tenant_id FROM public.profiles p WHERE m.user_id = p.id AND m.tenant_id IS NULL;
UPDATE public.mesocycles m SET tenant_id = p.tenant_id FROM public.profiles p WHERE m.athlete_id = p.id AND m.tenant_id IS NULL;
UPDATE public.set_performance m SET tenant_id = p.tenant_id FROM public.profiles p WHERE m.athlete_id = p.id AND m.tenant_id IS NULL;
UPDATE public.progress_photos m SET tenant_id = p.tenant_id FROM public.profiles p WHERE m.athlete_id = p.id AND m.tenant_id IS NULL;

-- 3. AUTOMATION INFRASTRUCTURE (Missing tables check)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- missed_session, membership_expiry, streak_achieved
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    metadata JSONB,
    dedup_key TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    rule_type TEXT NOT NULL, -- inactive_days, expiry_days_warning
    value INTEGER NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tenant_id, rule_type)
);

-- 4. RLS LOCKDOWN (Replacing permissive policies)
-- Flush old policies
DROP POLICY IF EXISTS "Enable read for authenticated" ON public.membership_plans;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.membership_plans;
DROP POLICY IF EXISTS "Enable read for authenticated" ON public.memberships;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.memberships;
DROP POLICY IF EXISTS "Enable read for authenticated" ON public.mesocycles;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.mesocycles;
DROP POLICY IF EXISTS "Enable read for authenticated" ON public.training_phases;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.training_phases;
DROP POLICY IF EXISTS "Enable read for authenticated" ON public.set_performance;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.set_performance;
DROP POLICY IF EXISTS "Enable read for authenticated" ON public.progress_photos;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.progress_photos;
DROP POLICY IF EXISTS "Enable read for authenticated" ON public.athlete_stats;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.athlete_stats;
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;

-- New Strict Tenant Isolation Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_rules ENABLE ROW LEVEL SECURITY;

-- Profiles: Isolate reads by tenant
CREATE POLICY "profiles_tenant_isolation" ON public.profiles FOR SELECT USING (tenant_id = get_auth_tenant_id());

-- Global/Tenant Table access logic:
-- Users see data only if it belongs to their tenant_id
CREATE POLICY "memberships_isolation" ON public.memberships FOR ALL USING (tenant_id = get_auth_tenant_id());
CREATE POLICY "mesocycles_isolation" ON public.mesocycles FOR ALL USING (tenant_id = get_auth_tenant_id());
CREATE POLICY "set_perf_isolation" ON public.set_performance FOR ALL USING (tenant_id = get_auth_tenant_id());
CREATE POLICY "photos_isolation" ON public.progress_photos FOR ALL USING (tenant_id = get_auth_tenant_id());
CREATE POLICY "notif_isolation" ON public.notifications FOR ALL USING (tenant_id = get_auth_tenant_id());
CREATE POLICY "rules_isolation" ON public.notification_rules FOR ALL USING (tenant_id = get_auth_tenant_id());

-- Special case: plans might be global or tenant-specific
CREATE POLICY "plans_isolation" ON public.membership_plans FOR SELECT USING (tenant_id IS NULL OR tenant_id = get_auth_tenant_id());

-- Special case: athlete_stats view isolation
CREATE POLICY "stats_isolation" ON public.athlete_stats FOR SELECT USING (
  athlete_id IN (SELECT id FROM public.profiles WHERE tenant_id = get_auth_tenant_id())
);
