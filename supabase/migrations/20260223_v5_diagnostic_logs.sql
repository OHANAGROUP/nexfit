-- NEXFIT v3.10.1 — Automation Audit & Diagnostic Helpers
-- Adds logging for the automation engine and helper functions.

-- 1. AUTOMATION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    task_name TEXT NOT NULL,      -- auto-notify, membership-sync, etc.
    status TEXT NOT NULL,         -- success, warning, error
    summary JSONB,                -- detail of items processed
    execution_time_ms INTEGER,
    error_message TEXT
);

ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated" ON public.automation_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. DIAGNOSTIC HELPER FUNCTIONS
-- These functions act as wrappers or placeholders for documentation of the engine.

-- Helper: auto_notify_inactive_athletes
CREATE OR REPLACE FUNCTION public.auto_notify_inactive_athletes() 
RETURNS VOID AS $$
BEGIN
    -- This logic is primarily handled by the Edge Function 'auto-notify'.
    -- This SQL function serves as a trigger point or manual diagnostic.
    INSERT INTO public.automation_logs (task_name, status, summary)
    VALUES ('manual_check_inactive', 'success', '{"info": "Triggered via SQL diagnostic"}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: auto_notify_membership_status
CREATE OR REPLACE FUNCTION public.auto_notify_membership_status() 
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.automation_logs (task_name, status, summary)
    VALUES ('manual_check_memberships', 'success', '{"info": "Triggered via SQL diagnostic"}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: run_daily_automation
-- Master wrapper that logs the intent
CREATE OR REPLACE FUNCTION public.run_daily_automation() 
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.automation_logs (task_name, status, summary)
    VALUES ('daily_automation_master', 'success', '{"triggered_at": now()}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ENSURE VIEW EXISTS FOR ANALYTICS
-- The Edge Function depends on 'athlete_stats'.
-- If it's a view, we define it here or ensure it's a table.
-- In 3.10.0 we created it as a table. Let's make sure it's up to date.
INSERT INTO public.athlete_stats (athlete_id, full_name, adherence_pct)
SELECT id, full_name, 0 FROM public.profiles WHERE role = 'member'
ON CONFLICT (athlete_id) DO NOTHING;
