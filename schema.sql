-- ============================================
-- NEXFIT DATABASE SCHEMA
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TENANTS
CREATE TABLE IF NOT EXISTS tenants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  logo_url      TEXT,
  primary_color TEXT DEFAULT '#7b2fff',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
  full_name   TEXT,
  role        TEXT DEFAULT 'member', -- gym_admin | trainer | member
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2.1 SECURITY HELPERS (Restored & Safe)
-- Using Security Definer to break RLS recursion for tenant isolation.
CREATE OR REPLACE FUNCTION public.get_auth_tenant()
RETURNS uuid AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 2.2 USER ACTIVATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'type', 'member'))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. EXERCISES
CREATE TABLE IF NOT EXISTS exercises (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID REFERENCES tenants(id),
  name          TEXT NOT NULL,
  muscle_group  TEXT NOT NULL,
  description   TEXT,
  image_url     TEXT,
  is_global     BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id   UUID REFERENCES exercises(id) ON DELETE SET NULL, -- Explicit FK
  sets          INT,
  reps          INT,
  weight_kg     NUMERIC,
  logged_date   DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MEALS (Nutrition Plan)
CREATE TABLE IF NOT EXISTS meals (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  time_of_day   TEXT, -- Desayuno, Almuerzo, etc.
  kcal          INT,
  macros        TEXT, -- e.g. "30P / 10C / 12G"
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MARKET ITEMS
CREATE TABLE IF NOT EXISTS market_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_name     TEXT NOT NULL,
  category      TEXT,
  is_checked    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BIOMETRICS (Tracking)
CREATE TABLE IF NOT EXISTS biometrics (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  metric_type   TEXT NOT NULL, -- weight, body_fat, etc.
  value         NUMERIC NOT NULL,
  logged_date   DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- RLS & POLICIES (Nuclear Cleanup Logic - Zero Recursion)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometrics ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Restricted to same tenant to prevent enumeration
DROP POLICY IF EXISTS "profiles_read_all" ON profiles;
CREATE POLICY "profiles_read_tenant" ON public.profiles 
  FOR SELECT TO authenticated 
  USING (tenant_id = public.get_auth_tenant());

DROP POLICY IF EXISTS "profiles_manage_self" ON profiles;
CREATE POLICY "profiles_manage_self" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id);

-- 2. Exercises: Open read for authenticated users
DROP POLICY IF EXISTS "exercise_read_all" ON exercises;
CREATE POLICY "exercise_read_all" ON exercises FOR SELECT TO authenticated USING (true);

-- 3. Private data policies
DROP POLICY IF EXISTS "activity_access" ON activity_logs;
CREATE POLICY "activity_access" ON activity_logs FOR ALL TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "meal_access" ON meals;
CREATE POLICY "meal_access" ON meals FOR ALL TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "market_access" ON market_items;
CREATE POLICY "market_access" ON market_items FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "biometric_access" ON biometrics;
CREATE POLICY "biometric_access" ON biometrics 
  FOR ALL TO authenticated 
  USING (user_id = auth.uid() AND tenant_id = public.get_auth_tenant());

-- ============================================
-- PHASE 2: ROUTINE TEMPLATES & ONBOARDING
-- ============================================

-- 8. ROUTINE TEMPLATES
CREATE TABLE IF NOT EXISTS routine_templates (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  trainer_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  target_level  TEXT DEFAULT 'all',
  goal_type     TEXT DEFAULT 'general',
  days_per_week INT DEFAULT 3,
  exercises     JSONB DEFAULT '[]',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TEMPLATE ASSIGNMENTS
CREATE TABLE IF NOT EXISTS template_assignments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  template_id   UUID REFERENCES routine_templates(id) ON DELETE CASCADE,
  athlete_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by   UUID REFERENCES profiles(id),
  start_date    DATE DEFAULT CURRENT_DATE,
  status        TEXT DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, athlete_id)
);

-- 10. ONBOARDING PROFILES
CREATE TABLE IF NOT EXISTS onboarding_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  goal            TEXT,
  level           TEXT,
  days_available  INT DEFAULT 3,
  preferred_time  TEXT,
  weight_kg       NUMERIC,
  height_cm       NUMERIC,
  bmi             NUMERIC GENERATED ALWAYS AS (
                    CASE WHEN height_cm > 0 
                    THEN ROUND((weight_kg / ((height_cm / 100.0) ^ 2))::NUMERIC, 1) 
                    ELSE NULL END
                  ) STORED,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TRAINING SCHEDULE
CREATE TABLE IF NOT EXISTS training_schedule (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  template_id   UUID REFERENCES routine_templates(id) ON DELETE SET NULL,
  scheduled_for DATE NOT NULL,
  day_name      TEXT,
  status        TEXT DEFAULT 'planned',
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Phase 2
ALTER TABLE routine_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "templates_manage" ON routine_templates;
CREATE POLICY "templates_manage" ON routine_templates
  FOR ALL TO authenticated
  USING (tenant_id = public.get_auth_tenant());

DROP POLICY IF EXISTS "assignments_manage" ON template_assignments;
CREATE POLICY "assignments_manage" ON template_assignments
  FOR ALL TO authenticated
  USING (tenant_id = public.get_auth_tenant());

DROP POLICY IF EXISTS "onboarding_self" ON onboarding_profiles;
CREATE POLICY "onboarding_self" ON onboarding_profiles
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR tenant_id = public.get_auth_tenant());

DROP POLICY IF EXISTS "schedule_access" ON training_schedule;
CREATE POLICY "schedule_access" ON training_schedule
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR tenant_id = public.get_auth_tenant());

-- ============================================
-- PHASE 3: ANALYTICS & SMART NOTIFICATIONS
-- ============================================

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,  -- recipient
  type          TEXT NOT NULL, -- missed_session | streak_achieved | goal_reached | weekly_report
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  severity      TEXT DEFAULT 'info', -- info | warning | success
  is_read       BOOLEAN DEFAULT FALSE,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_access" ON notifications;
CREATE POLICY "notifications_access" ON notifications
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR tenant_id = public.get_auth_tenant());

-- 13. ATHLETE STATS VIEW (pre-computed KPIs)
CREATE OR REPLACE VIEW athlete_stats AS
SELECT
  p.id AS user_id,
  p.tenant_id,
  p.full_name,
  COUNT(ts.id) FILTER (WHERE ts.status = 'done') AS sessions_done,
  COUNT(ts.id) FILTER (WHERE ts.status = 'planned' OR ts.status = 'done') AS sessions_planned,
  CASE
    WHEN COUNT(ts.id) FILTER (WHERE ts.status = 'planned' OR ts.status = 'done') = 0 THEN 0
    ELSE ROUND(
      100.0 * COUNT(ts.id) FILTER (WHERE ts.status = 'done') /
      NULLIF(COUNT(ts.id) FILTER (WHERE ts.status = 'planned' OR ts.status = 'done'), 0)
    )
  END AS adherence_pct,
  COUNT(ts.id) FILTER (WHERE ts.status = 'skipped') AS sessions_skipped
FROM profiles p
LEFT JOIN training_schedule ts ON ts.user_id = p.id
GROUP BY p.id, p.tenant_id, p.full_name;


