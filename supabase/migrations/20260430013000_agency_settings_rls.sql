ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_agency_settings" ON public.agency_settings;
DROP POLICY IF EXISTS "admin_write_agency_settings" ON public.agency_settings;

CREATE POLICY "authenticated_select_agency_settings"
  ON public.agency_settings FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_write_agency_settings"
  ON public.agency_settings FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT ALL ON TABLE public.agency_settings TO authenticated;
GRANT ALL ON TABLE public.agency_settings TO service_role;
