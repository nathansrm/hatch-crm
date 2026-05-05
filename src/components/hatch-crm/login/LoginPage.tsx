import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useLogin, useNotify, useTranslate } from "ra-core";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Notification } from "@/components/admin/notification";
import { useConfigurationContext } from "@/components/hatch-crm/root/ConfigurationContext.tsx";
import { HatchCard } from "../_primitives";
import { SSOAuthButton } from "./SSOAuthButton";

type LoginData = {
  email: string;
  password: string;
};

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>();

  const emailLabel = translate("ra.auth.email", { _: "Email" });
  const passwordLabel = translate("ra.auth.password", { _: "Password" });
  const getRequiredMessage = (label: string) => `${label} is required`;
  const getFieldErrorMessage = (message: unknown) =>
    typeof message === "string" ? message : undefined;

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

  const onSubmit: SubmitHandler<LoginData> = (values) => {
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
    <div className="relative min-h-screen overflow-hidden bg-[#06111F] p-8">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#4DC8E8] opacity-[0.06] blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(77,200,232,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(77,200,232,0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative flex items-center gap-3">
        <img
          src={darkModeLogo}
          alt={title}
          className="h-10 w-auto max-w-[240px] object-contain"
        />
      </div>

      <div className="relative mx-auto mt-12 max-w-md">
        <div className="mb-6 space-y-2 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(77,200,232,0.3)] bg-[rgba(77,200,232,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7DDCF0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4DC8E8] shadow-[0_0_8px_#4DC8E8]" />
            Welcome back
          </div>
          <h2 className="font-heading text-3xl font-bold tracking-[-0.02em] text-[#ECEEF5]">
            {translate("ra.auth.sign_in")}
          </h2>
          <p className="text-sm text-[rgba(236,238,245,0.6)]">
            Continue into your Hatch Theory CRM workspace.
          </p>
        </div>

        <HatchCard padding="lg">
          <div className="space-y-5">
            {disableEmailPasswordAuthentication ? null : (
              <form
                className="space-y-5"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                {errorMessage && (
                  <div
                    role="alert"
                    className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {errorMessage}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="login_email">{emailLabel}</Label>
                  <Input
                    {...register("email", {
                      required: getRequiredMessage(emailLabel),
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address",
                      },
                    })}
                    id="login_email"
                    type="email"
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={
                      errors.email ? "login_email-error" : undefined
                    }
                  />
                  {getFieldErrorMessage(errors.email?.message) ? (
                    <p
                      id="login_email-error"
                      className="text-sm text-destructive"
                    >
                      {getFieldErrorMessage(errors.email?.message)}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="login_password">{passwordLabel}</Label>
                  <Input
                    {...register("password", {
                      required: getRequiredMessage(passwordLabel),
                    })}
                    id="login_password"
                    type="password"
                    aria-invalid={errors.password ? true : undefined}
                    aria-describedby={
                      errors.password ? "login_password-error" : undefined
                    }
                  />
                  {getFieldErrorMessage(errors.password?.message) ? (
                    <p
                      id="login_password-error"
                      className="text-sm text-destructive"
                    >
                      {getFieldErrorMessage(errors.password?.message)}
                    </p>
                  ) : null}
                </div>
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
              </form>
            )}
            {googleWorkplaceDomain ? (
              <SSOAuthButton className="w-full" domain={googleWorkplaceDomain}>
                {translate("crm.auth.sign_in_google_workspace", {
                  _: "Sign in with Google Workplace",
                })}
              </SSOAuthButton>
            ) : null}
            {disableEmailPasswordAuthentication ? null : (
              <div className="space-y-3">
                <Link
                  to={"/forgot-password"}
                  className="block text-center text-sm text-[rgba(236,238,245,0.6)] hover:text-[#7DDCF0] hover:underline"
                >
                  {translate("ra-supabase.auth.forgot_password", {
                    _: "Forgot password?",
                  })}
                </Link>
                <Button
                  asChild
                  variant="outline"
                  className="min-h-11 w-full border-[rgba(77,200,232,0.35)] bg-transparent font-semibold text-[#ECEEF5] hover:border-[#7DDCF0] hover:bg-[rgba(77,200,232,0.08)] hover:text-[#7DDCF0]"
                >
                  <Link to="/sign-up">
                    {translate("crm.auth.signup.create_account", {
                      _: "Create account",
                    })}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </HatchCard>
      </div>
      <Notification />
    </div>
  );
};
