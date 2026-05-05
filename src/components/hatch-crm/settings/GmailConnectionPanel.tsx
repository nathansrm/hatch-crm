import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Mail, RefreshCcw, Unplug } from "lucide-react";
import { useNotify } from "ra-core";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { getSupabaseClient } from "../providers/supabase/supabase";

type GmailStatus = {
  connected: boolean;
  google_email?: string;
  status: "connected" | "disconnected" | "revoked" | "error";
  last_error?: string | null;
  connected_at?: string | null;
};

const getFunctionErrorMessage = async (error: any) => {
  try {
    const data = await error?.context?.json();
    if (typeof data?.error === "string" && data.error.length > 0) {
      return data.error;
    }
  } catch {
    // Ignore context parsing failures
  }

  return typeof error?.message === "string" && error.message.length > 0
    ? error.message
    : "Gmail request failed.";
};

const invokeGmailFunction = async <T,>(name: string) => {
  const { data, error } = await getSupabaseClient().functions.invoke<T>(name, {
    method: "POST",
  });
  if (error) {
    throw new Error(await getFunctionErrorMessage(error));
  }
  return data as T;
};

export const GmailConnectionPanel = ({
  surface = "desktop",
}: {
  surface?: "desktop" | "mobile";
}) => {
  const notify = useNotify();
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await invokeGmailFunction<GmailStatus>("gmail-oauth-status");
      setStatus(data);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Failed to load Gmail", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "hatch:gmail-oauth-complete") {
        refreshStatus();
      }
    };
    window.addEventListener("message", handleMessage);
    window.addEventListener("focus", refreshStatus);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("focus", refreshStatus);
    };
  }, [refreshStatus]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const data = await invokeGmailFunction<{ authorization_url: string }>(
        "gmail-oauth-start",
      );
      const popup = window.open(
        data.authorization_url,
        "hatch-gmail-oauth",
        "popup,width=560,height=720",
      );
      if (!popup) {
        window.location.href = data.authorization_url;
        return;
      }
      const timer = window.setInterval(() => {
        if (popup.closed) {
          window.clearInterval(timer);
          refreshStatus();
          setConnecting(false);
        }
      }, 1000);
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Failed to start Gmail OAuth",
        { type: "error" },
      );
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Disconnect Gmail from this CRM account?")) {
      return;
    }
    setDisconnecting(true);
    try {
      await invokeGmailFunction("gmail-oauth-disconnect");
      await refreshStatus();
      notify("Gmail disconnected");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Failed to disconnect Gmail",
        { type: "error" },
      );
    } finally {
      setDisconnecting(false);
    }
  };

  if (surface === "mobile") {
    return (
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1 mb-1.5">
          Gmail
        </p>
        <ItemGroup className="rounded-lg border overflow-hidden">
          <Item size="sm" className="items-start">
            <ItemContent>
              <ItemTitle className="font-normal">
                {status?.connected ? status.google_email : "Not connected"}
              </ItemTitle>
              <ItemDescription>
                {status?.connected
                  ? "Outreach emails send through this Gmail account."
                  : "Connect Gmail so CRM outreach appears in Sent Mail."}
              </ItemDescription>
              {status?.status === "error" && status.last_error ? (
                <ItemDescription className="text-destructive">
                  {status.last_error}
                </ItemDescription>
              ) : null}
            </ItemContent>
            <ItemActions>
              {status?.connected ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={disconnecting}
                  onClick={handleDisconnect}
                  aria-label="Disconnect Gmail"
                >
                  <Unplug className="size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  disabled={loading || connecting}
                  onClick={handleConnect}
                >
                  <Mail className="size-4 mr-2" />
                  Connect
                </Button>
              )}
            </ItemActions>
          </Item>
        </ItemGroup>
      </div>
    );
  }

  return (
    <section
      id="gmail"
      style={{
        marginBottom: 32,
        maxWidth: 680,
        padding: "24px 28px",
        borderRadius: 12,
        background: "var(--ink-3)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            fontSize: 9.5,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--hatch-cyan)",
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          Integrations
        </div>
        <h2
          className="font-heading"
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: "var(--fg-1)",
          }}
        >
          Gmail
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 18,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: "var(--fg-1)",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            {status?.connected ? status.google_email : "No Gmail connected"}
          </div>
          <p
            style={{
              margin: 0,
              color: "var(--fg-2-muted)",
              fontSize: 13,
              lineHeight: 1.55,
            }}
          >
            {status?.connected
              ? "Approved outreach emails will send through this Gmail account and appear in Gmail Sent Mail."
              : "Connect Gmail to send CRM outreach from your actual account."}
          </p>
          {status?.status === "error" && status.last_error ? (
            <p
              style={{
                margin: "8px 0 0",
                color: "var(--danger)",
                fontSize: 12.5,
              }}
            >
              {status.last_error}
            </p>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            disabled={loading}
            onClick={refreshStatus}
            aria-label="Refresh Gmail status"
            style={{
              width: 36,
              height: 36,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent",
              color: "var(--fg-2)",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            <RefreshCcw size={15} />
          </button>
          {status?.connected ? (
            <button
              type="button"
              disabled={disconnecting}
              onClick={handleDisconnect}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 14px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent",
                color: "var(--fg-2)",
                fontSize: 13,
                fontWeight: 650,
                cursor: disconnecting ? "not-allowed" : "pointer",
              }}
            >
              <Unplug size={15} />
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              disabled={loading || connecting}
              onClick={handleConnect}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 14px",
                borderRadius: 8,
                border: "none",
                background: "var(--hatch-cyan)",
                color: "var(--hatch-ink)",
                fontSize: 13,
                fontWeight: 750,
                cursor: loading || connecting ? "not-allowed" : "pointer",
              }}
            >
              <ExternalLink size={15} />
              {connecting ? "Connecting" : "Connect Gmail"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
