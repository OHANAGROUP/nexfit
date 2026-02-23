-- NEXFIT v3.10.5 — Profiles RLS Fix
-- This script allows Trainers and Admins to create new member profiles within their tenant.

-- 0. TENANT ISOLATION HELPER (Ensuring existence)
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. ADD INSERT/UPDATE POLICIES FOR PROFILES
-- Existing Select Policy: "profiles_tenant_isolation" (SELECT USING (tenant_id = get_auth_tenant_id()))

-- Policy: Allow Trainers/Admins to insert new members
-- We verify the role of the creator and ensuring the new profile's tenant_id matches the creator's.
CREATE POLICY "profiles_insert_trainer" ON public.profiles
FOR INSERT 
WITH CHECK (
  -- Creator must be an admin or gym_admin
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('gym_admin', 'super_admin', 'trainer')
  )
  AND 
  -- New profile must belong to the same tenant as the creator
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  AND
  -- New profile must have the role 'member' (unless created by super_admin)
  (role = 'member' OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin')
);

-- Policy: Allow Trainers/Admins to update their members
CREATE POLICY "profiles_update_trainer" ON public.profiles
FOR UPDATE
USING (tenant_id = get_auth_tenant_id())
WITH CHECK (tenant_id = get_auth_tenant_id());

-- 2. ENSURE AUTO-ASSIGNMENT HELPER (Optional but good for robustness)
-- If we want to ensure any new profile without a tenant_id inherits the creator's:
-- This is better handled in the RLS WITH CHECK as above to prevent cross-tenant injection.
