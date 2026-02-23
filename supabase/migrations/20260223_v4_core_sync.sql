-- NEXFIT MASTER SYNC MIGRATION (v3.10.0)
-- Consolidates all tables for Memberships, Periodization, Performance, and Photos.

-- 1. MEMBERSHIPS & PLANS
CREATE TABLE IF NOT EXISTS public.membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_months INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.membership_plans(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, expired, cancelled, suspended
    starts_at DATE NOT NULL DEFAULT CURRENT_DATE,
    ends_at DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PERIODIZATION (MESOCYCLES & PHASES)
CREATE TABLE IF NOT EXISTS public.mesocycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    goal TEXT NOT NULL, -- strength, hypertrophy, performance, health, deload
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.training_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mesocycle_id UUID REFERENCES public.mesocycles(id) ON DELETE CASCADE NOT NULL,
    week_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    intensity_target TEXT,
    volume_target TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PERFORMANCE TRACKING (SETS & RPE)
CREATE TABLE IF NOT EXISTS public.set_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    routine_id UUID, -- Optional link to scheduled session
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    exercise_name TEXT NOT NULL,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight_kg DECIMAL(10,2) NOT NULL,
    rpe DECIMAL(3,1), -- 1-10 Effort
    muscle_group TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PROGRESS PHOTOS METADATA
CREATE TABLE IF NOT EXISTS public.progress_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    photo_url TEXT NOT NULL, -- Public URL from Supabase Storage
    label TEXT,              -- Frente, Lateral, Espalda
    weight DECIMAL(5,2),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ANALYTICS (SUMMARY TABLE)
CREATE TABLE IF NOT EXISTS public.athlete_stats (
    athlete_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    adherence_pct INTEGER DEFAULT 0,
    sessions_done INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. RLS POLICIES (Simplified for NEXFIT Admin/Trainer approach)
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesocycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_stats ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users read access (trainers)
CREATE POLICY "Enable read for authenticated" ON public.membership_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated" ON public.memberships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated" ON public.mesocycles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated" ON public.training_phases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated" ON public.set_performance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated" ON public.progress_photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated" ON public.athlete_stats FOR SELECT TO authenticated USING (true);

-- Allow all authenticated users insert/update (trainers managing athletes)
CREATE POLICY "Enable all for authenticated" ON public.membership_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON public.memberships FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON public.mesocycles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON public.training_phases FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON public.set_performance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON public.progress_photos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON public.athlete_stats FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. STORAGE BUCKET INITIALIZATION (Manual instruction needed but SQL reference)
-- Note: progress-photos bucket must be created in Supabase Dashboard with Public access.
