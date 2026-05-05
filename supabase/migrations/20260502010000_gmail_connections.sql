CREATE TABLE public.gmail_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_email TEXT NOT NULL,
  encrypted_refresh_token TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  access_token_expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'connected'
    CHECK (status IN ('connected', 'revoked', 'error')),
  last_error TEXT,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX idx_gmail_connections_user_status
  ON public.gmail_connections (user_id, status);

CREATE TRIGGER set_gmail_connections_updated_at
  BEFORE UPDATE ON public.gmail_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.gmail_connections ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.gmail_connections FROM anon;
REVOKE ALL ON TABLE public.gmail_connections FROM authenticated;
GRANT ALL ON TABLE public.gmail_connections TO service_role;

CREATE TABLE public.gmail_oauth_states (
  state_hash TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gmail_oauth_states_user_id
  ON public.gmail_oauth_states (user_id);

CREATE INDEX idx_gmail_oauth_states_expires_at
  ON public.gmail_oauth_states (expires_at);

ALTER TABLE public.gmail_oauth_states ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.gmail_oauth_states FROM anon;
REVOKE ALL ON TABLE public.gmail_oauth_states FROM authenticated;
GRANT ALL ON TABLE public.gmail_oauth_states TO service_role;
