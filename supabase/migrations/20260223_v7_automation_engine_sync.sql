-- NEXFIT v3.10.3 — Automation Engine Logic Sync
-- Merges the functional logic from v3.4.1 with the secure v3.10.2 schema.

-- 1. SCHEMA EXTENSIONS
-- Add channel to notifications if missing
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'in_app';
-- Ensure severity defaults and naming match
ALTER TABLE public.notifications ALTER COLUMN severity SET DEFAULT 'low';

-- Add counters to automation_logs to match the fix script
ALTER TABLE public.automation_logs ADD COLUMN IF NOT EXISTS inactive_notifs INT DEFAULT 0;
ALTER TABLE public.automation_logs ADD COLUMN IF NOT EXISTS membership_notifs INT DEFAULT 0;
ALTER TABLE public.automation_logs ADD COLUMN IF NOT EXISTS achievement_notifs INT DEFAULT 0;
ALTER TABLE public.automation_logs ADD COLUMN IF NOT EXISTS total INT DEFAULT 0;

-- 2. NOTIFICATION RULES (Ensure isolation)
CREATE TABLE IF NOT EXISTS public.notification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    rule_type TEXT NOT NULL, -- inactivity, expiry_warning
    threshold_days INTEGER DEFAULT 3,
    is_enabled BOOLEAN DEFAULT true, -- renamed from is_active for internal consistency or kept if requested
    message_template TEXT,
    channel TEXT DEFAULT 'in_app',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tenant_id, rule_type)
);

-- RLS for Rules (Tenant Isolation)
ALTER TABLE public.notification_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rules_tenant_isolation" ON public.notification_rules;
CREATE POLICY "rules_tenant_isolation" ON public.notification_rules FOR ALL USING (tenant_id = get_auth_tenant_id());

-- Seed default rules for all tenants if missing
INSERT INTO public.notification_rules (tenant_id, rule_type, threshold_days, message_template)
SELECT id, 'inactivity', 3, 'Hola {name}, llevas {days} días sin entrenar. ¡Tu racha te espera! 💪'
FROM public.tenants
ON CONFLICT (tenant_id, rule_type) DO NOTHING;

-- 3. FUNCTIONAL MOTOR LOGIC (Security & Schema Aligned)

-- Function 1: Inactivity Detection
CREATE OR REPLACE FUNCTION public.auto_notify_inactive_athletes()
RETURNS INT AS $$
DECLARE
  rec           RECORD;
  last_activity DATE;
  days_inactive INT;
  notif_count   INT := 0;
  already_sent  BOOLEAN;
BEGIN
  -- Iterate through members with active rules
  FOR rec IN
    SELECT p.id AS user_id, p.full_name, p.tenant_id,
           nr.threshold_days, nr.message_template, nr.channel
    FROM public.profiles p
    JOIN public.notification_rules nr
      ON nr.tenant_id = p.tenant_id
     AND nr.rule_type = 'inactivity'
     AND nr.is_enabled = TRUE
    WHERE p.role = 'member'
  LOOP
    -- Get last activity from activity_logs (synced in v4/v10)
    SELECT MAX(scheduled_for::DATE) INTO last_activity
    FROM public.training_schedule 
    WHERE user_id = rec.user_id AND status = 'done';

    IF last_activity IS NULL THEN
      -- Fallback to profile creation
      SELECT created_at::DATE INTO last_activity
      FROM public.profiles WHERE id = rec.user_id;
    END IF;

    days_inactive := CURRENT_DATE - last_activity;

    IF days_inactive >= rec.threshold_days THEN
      -- Deduplication: once per day
      SELECT EXISTS (
        SELECT 1 FROM public.notifications
        WHERE user_id = rec.user_id 
          AND type = 'inactivity'
          AND created_at::DATE = CURRENT_DATE
      ) INTO already_sent;

      IF NOT already_sent THEN
        INSERT INTO public.notifications
          (tenant_id, user_id, type, severity, title, message, channel, metadata)
        VALUES (
          rec.tenant_id, rec.user_id, 'inactivity',
          CASE WHEN days_inactive >= 7 THEN 'high'
               WHEN days_inactive >= 5 THEN 'medium' ELSE 'low' END,
          '⚡ Sin actividad registrada',
          REPLACE(REPLACE(rec.message_template,'{name}',rec.full_name), '{days}', days_inactive::TEXT),
          rec.channel,
          jsonb_build_object('days_inactive', days_inactive, 'last_activity', last_activity)
        );
        notif_count := notif_count + 1;
      END IF;
    END IF;
  END LOOP;
  RETURN notif_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Membership Expiry (Aligned with 'expires_at' and 'tenant_id')
CREATE OR REPLACE FUNCTION public.auto_notify_membership_status()
RETURNS INT AS $$
DECLARE
  rec          RECORD;
  notif_count  INT := 0;
  already_sent BOOLEAN;
BEGIN
  FOR rec IN
    SELECT m.id AS membership_id, m.user_id, m.tenant_id,
           m.expires_at, p.full_name,
           (m.expires_at - CURRENT_DATE) AS days_left,
           mp.name AS plan_name, mp.price
    FROM public.memberships m
    JOIN public.profiles p ON p.id = m.user_id
    LEFT JOIN public.membership_plans mp ON mp.id = m.plan_id
    WHERE m.status IN ('active','expiring_soon')
      AND m.tenant_id IS NOT NULL
  LOOP
    -- Warning Window: 1-3 days
    IF rec.days_left BETWEEN 1 AND 3 THEN
      UPDATE public.memberships SET status = 'expiring_soon' WHERE id = rec.membership_id;

      SELECT EXISTS (
        SELECT 1 FROM public.notifications
        WHERE user_id = rec.user_id AND type = 'membership_expiry'
          AND created_at::DATE = CURRENT_DATE
      ) INTO already_sent;

      IF NOT already_sent THEN
        INSERT INTO public.notifications (tenant_id, user_id, type, severity, title, message, metadata)
        VALUES (
          rec.tenant_id, rec.user_id, 'membership_expiry', 'high',
          '💳 Tu membresía vence pronto',
          'Hola ' || rec.full_name || ', tu plan ' || COALESCE(rec.plan_name,'actual') || 
          ' vence el ' || to_char(rec.expires_at,'DD/MM/YYYY') || '. ¡Renuévala para continuar!',
          jsonb_build_object('expires_at', rec.expires_at, 'days_left', rec.days_left, 'price', rec.price)
        );
        notif_count := notif_count + 1;
      END IF;

    -- Expiry
    ELSIF rec.days_left <= 0 THEN
      UPDATE public.memberships SET status = 'expired' WHERE id = rec.membership_id;

      SELECT EXISTS (
        SELECT 1 FROM public.notifications
        WHERE user_id = rec.user_id AND type = 'membership_expired'
          AND created_at::DATE = CURRENT_DATE
      ) INTO already_sent;

      IF NOT already_sent THEN
        INSERT INTO public.notifications (tenant_id, user_id, type, severity, title, message, metadata)
        VALUES (
          rec.tenant_id, rec.user_id, 'membership_expired', 'high',
          '🔴 Membresía vencida',
          'Hola ' || rec.full_name || ', tu membresía venció el ' || to_char(rec.expires_at,'DD/MM/YYYY') || '. Contacta a tu gimnasio para renovar.',
          jsonb_build_object('expired_at', rec.expires_at)
        );
        notif_count := notif_count + 1;
      END IF;
    END IF;
  END LOOP;
  RETURN notif_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Streak Milestones (Mapped to training_schedule)
CREATE OR REPLACE FUNCTION public.auto_notify_achievements()
RETURNS INT AS $$
DECLARE
  rec          RECORD;
  streak       INT;
  notif_count  INT := 0;
  already_sent BOOLEAN;
BEGIN
  FOR rec IN
    SELECT p.id AS user_id, p.full_name, p.tenant_id
    FROM public.profiles p WHERE p.role = 'member'
  LOOP
    -- Calculate streak from training_schedule
    WITH ranked AS (
      SELECT scheduled_for::DATE as d,
             scheduled_for::DATE - ROW_NUMBER() OVER (ORDER BY scheduled_for)::INT AS grp
      FROM (SELECT DISTINCT scheduled_for::DATE FROM public.training_schedule
            WHERE user_id = rec.user_id AND status = 'done') d
    )
    SELECT COUNT(*) INTO streak FROM ranked
    WHERE grp = (SELECT grp FROM ranked ORDER BY d DESC LIMIT 1);

    IF streak IN (7,14,30,60,100) THEN
      SELECT EXISTS (
        SELECT 1 FROM public.notifications
        WHERE user_id = rec.user_id AND type = 'streak_achieved'
          AND metadata->>'streak' = streak::TEXT
      ) INTO already_sent;

      IF NOT already_sent THEN
        INSERT INTO public.notifications (tenant_id, user_id, type, severity, title, message, metadata)
        VALUES (
          rec.tenant_id, rec.user_id, 'streak_achieved', 'low',
          '🏆 ¡' || streak || ' días de racha!',
          '¡Felicidades ' || rec.full_name || '! Llevas ' || streak || ' días entrenando seguidos. ¡Eres imparable! 🔥',
          jsonb_build_object('streak', streak)
        );
        notif_count := notif_count + 1;
      END IF;
    END IF;
  END LOOP;
  RETURN notif_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Master Automation Wrapper
CREATE OR REPLACE FUNCTION public.run_daily_automation()
RETURNS JSONB AS $$
DECLARE
  n1 INT := 0; n2 INT := 0; n3 INT := 0;
  start_time TIMESTAMPTZ := now();
BEGIN
  -- Execute detect logic
  SELECT public.auto_notify_inactive_athletes() INTO n1;
  SELECT public.auto_notify_membership_status() INTO n2;
  SELECT public.auto_notify_achievements()      INTO n3;

  -- Log result
  INSERT INTO public.automation_logs
    (task_name, status, inactive_notifs, membership_notifs, achievement_notifs, total, execution_time_ms)
  VALUES (
    'daily_automation_sync', 
    'success', 
    n1, n2, n3, n1+n2+n3,
    (EXTRACT(EPOCH FROM (now() - start_time)) * 1000)::INT
  );

  RETURN jsonb_build_object(
    'run_at', now(),
    'inactive_notifs', n1,
    'membership_notifs', n2,
    'achievement_notifs', n3,
    'total', n1 + n2 + n3
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
