-- ============================================================
-- NEXFIT v3.10.4 — CRON ACTIVATION FIX
-- Use this if you get "schema cron does not exist"
-- ============================================================

-- 1. Force enable the extension in the correct schema
-- (In Supabase, extensions usually live in the 'extensions' or 'public' schema,
-- but pg_cron creates its own 'cron' schema)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA public;

-- 2. Verify schema and functions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'cron') THEN
        RAISE NOTICE 'Schema cron still missing. Ensure you enabled it in Supabase Dashboard -> Extensions.';
    ELSE
        RAISE NOTICE 'Schema cron detected.';
    END IF;
END $$;

-- 3. Register the daily automation job
-- This runs at 08:00 UTC every day.
-- We use public.run_daily_automation() to ensure the function is found.
SELECT cron.schedule(
    'nexfit-daily-automation', 
    '0 8 * * *', 
    'SELECT public.run_daily_automation();'
);

-- 4. Verification queries
SELECT * FROM cron.job;
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
