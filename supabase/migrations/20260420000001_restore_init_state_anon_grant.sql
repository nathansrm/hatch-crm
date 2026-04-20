-- Restore anon SELECT on init_state
-- Revoked by 20260410120000_security_hardening bulk revoke.
-- init_state is an app bootstrap view (not user data) — anon read is required for getIsInitialized().
GRANT SELECT ON public.init_state TO anon;
