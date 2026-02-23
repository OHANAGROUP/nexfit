-- ============================================
-- PHASE 4B: AUTO-NOTIFY CRON SCHEDULE
-- Run this in Supabase SQL Editor ONCE
-- ============================================

-- Step 1: Enable pg_cron extension (if not enabled)
-- Go to: Dashboard → Database → Extensions → pg_cron → Enable

-- Step 2: Enable pg_net extension (for HTTP from SQL)
-- Go to: Dashboard → Database → Extensions → pg_net → Enable

-- Step 3: Schedule (runs daily at 08:00 UTC)
-- Replace YOUR_PROJECT_REF with your Supabase project ref
-- Replace YOUR_SERVICE_ROLE_KEY with your service_role key

/*
SELECT cron.schedule(
  'auto-notify-daily',
  '0 8 * * *',
  $$
    SELECT net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/auto-notify',
      headers := jsonb_build_object(
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  $$
);
*/

-- Step 4: Verify jobs
-- SELECT * FROM cron.job;

-- Step 5: Check job history
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- ============================================
-- MANUAL TRIGGER (for testing):
-- ============================================
-- Use Supabase CLI:
-- npx supabase functions invoke auto-notify --local
-- npx supabase functions invoke auto-notify  (production)
