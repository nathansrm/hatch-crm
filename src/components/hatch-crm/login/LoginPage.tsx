import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Form,
  email,
  required,
  useLogin,
  useNotify,
  useTranslate,
} from "ra-core";
import type { SubmitHandler, FieldValues } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/admin/text-input";
import { Notification } from "@/components/admin/notification";
import { useConfigurationContext } from "@/components/hatch-crm/root/ConfigurationContext.tsx";
import { HatchCard } from "../_primitives";
import { SSOAuthButton } from "./SSOAuthButton";

/**
 * Login page displayed when authentication is enabled and the user is not authenticated.
 */
export const LoginPage = (props: { redirectTo?: string }) => {
  const {
    darkModeLogo,
    title,
    googleWorkplaceDomain,
    disableEmailPasswordAuthentication,
  } = useConfigurationContext();
  const { redirectTo } = props;
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasDisplayedRecoveryNotification = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const login = useLogin();
  const notify = useNotify();
  const translate = useTranslate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const shouldNotify = searchParams.get("passwordRecoveryEmailSent") === "1";

    if (!shouldNotify || hasDisplayedRecoveryNotification.current) {
      return;
    }

    hasDisplayedRecoveryNotification.current = true;
    notify("crm.auth.recovery_email_sent", {
      type: "success",
      messageArgs: {
        _: "If you're a registered user, you should receive a password recovery email shortly.",
      },
    });

    searchParams.delete("passwordRecoveryEmailSent");
    const nextSearch = searchParams.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true },
    );
  }, [location.pathname, location.search, navigate, notify]);

  const handleSubmit: SubmitHandler<FieldValues> = (values) => {
    setErrorMessage(null);
    setLoading(true);
    login(values, redirectTo)
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        const resolvedMessage =
          typeof error === "string"
            ? error
            : typeof error === "undefined" || !error.message
              ? "ra.auth.sign_in_error"
              : error.message;

        setLoading(false);
        setErrorMessage(resolvedMessage);
        notify(resolvedMessage, {
          type: "error",
          messageArgs: {
            _:
              typeof error === "string"
                ? error
                : error && error.message
                  ? error.message
                  : undefined,
          },
        });
      });
  };

  return (
    <div className="min-h-screen flex bg-[#06111F]">
      <div className="relative grid w-full lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden h-full flex-col overflow-hidden p-10 text-white lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#15314A_0%,#0A1A2E_55%,#06111F_100%)]" />
          {/* Subtle hatch grid */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(0deg, rgba(77,200,232,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(77,200,232,0.5) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Glow */}
          <div className="absolute -left-32 top-1/3 h-[480px] w-[480px] rounded-full bg-[#4DC8E8] opacity-[0.08] blur-3xl" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <img className="mr-2 h-6" src={darkModeLogo} alt={title} />
          </div>
          <div className="relative z-20 mt-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(77,200,232,0.3)] bg-[rgba(77,200,232,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7DDCF0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4DC8E8] shadow-[0_0_8px_#4DC8E8]" />
              Hatch CRM
            </div>
            <blockquote className="space-y-3">
              <p className="font-heading text-3xl font-bold leading-tight tracking-[-0.02em] text-[#ECEEF5]">
                Built for builders.
                <br />
                <span className="text-[#7DDCF0]">Your pipeline, your way.</span>
              </p>
              <footer className="text-sm text-[rgba(236,238,245,0.5)]">
                — The Hatch team
              </footer>
            </blockquote>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center w-full p-4 lg:p-8">
          <div className="w-full lg:mx-auto lg:w-[400px]">
            <HatchCard padding="lg">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(236,238,245,0.5)]">
                    Welcome back
                  </div>
                  <h1 className="font-heading text-2xl font-bold tracking-[-0.02em] text-[#ECEEF5]">
                    {translate("ra.auth.sign_in")}
                  </h1>
                </div>
                {disableEmailPasswordAuthentication ? null : (
                  <Form className="space-y-6" onSubmit={handleSubmit} noValidate>
                    {errorMessage && (
                      <div
                        role="alert"
                        className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {errorMessage}
                      </div>
                    )}
                    <TextInput
                      label="ra.auth.email"
                      source="email"
                      type="email"
                      validate={[required(), email()]}
                    />
                    <TextInput
                      label="ra.auth.password"
                      source="password"
                      type="password"
                      validate={required()}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-[#4DC8E8] font-semibold text-[#06111F] shadow-[0_0_20px_rgba(77,200,232,0.25)] hover:bg-[#7DDCF0]"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {"Signing in\u2026"}
                        </>
                      ) : (
                        translate("ra.auth.sign_in")
                      )}
                    </Button>
                  </Form>
                )}
                {googleWorkplaceDomain ? (
                  <SSOAuthButton
                    className="w-full"
                    domain={googleWorkplaceDomain}
                  >
                    {translate("crm.auth.sign_in_google_workspace", {
                      _: "Sign in with Google Workplace",
                    })}
                  </SSOAuthButton>
                ) : null}
                {disableEmailPasswordAuthentication ? null : (
                  <Link
                    to={"/forgot-password"}
                    className="block text-center text-sm text-[rgba(236,238,245,0.6)] hover:text-[#7DDCF0] hover:underline"
                  >
                    {translate("ra-supabase.auth.forgot_password", {
                      _: "Forgot password?",
                    })}
                  </Link>
                )}
              </div>
            </HatchCard>
          </div>
        </div>
      </div>
      <Notification />
    </div>
  );
};
