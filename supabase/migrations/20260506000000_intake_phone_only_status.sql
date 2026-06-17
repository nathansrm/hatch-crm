ALTER TABLE public.intake_leads DROP CONSTRAINT IF EXISTS intake_leads_status_check;

ALTER TABLE public.intake_leads ADD CONSTRAINT intake_leads_status_check CHECK (status IN ('uncontacted', 'in-sequence', 'engaged', 'not-interested', 'unresponsive', 'qualified', 'rejected', 'phone-only'));

CREATE INDEX IF NOT EXISTS intake_leads_phone_only_idx ON public.intake_leads (id) WHERE status = 'phone-only';
