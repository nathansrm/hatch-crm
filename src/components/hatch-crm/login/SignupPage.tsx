import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useDataProvider, useLogin, useNotify, useTranslate } from "ra-core";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Navigate, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { HatchCard } from "../_primitives";
import type { CrmDataProvider } from "../providers/types";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { SignUpData } from "../types";
import { LoginSkeleton } from "./LoginSkeleton";
import { Notification } from "@/components/admin/notification";
import { ConfirmationRequired } from "./ConfirmationRequired";
import { SSOAuthButton } from "./SSOAuthButton";

export const SignupPage = () => {
  const queryClient = useQueryClient();
  const dataProvider = useDataProvider<CrmDataProvider>();
  const {
    darkModeLogo: logo,
    title,
    googleWorkplaceDomain,
  } = useConfigurationContext();
  const navigate = useNavigate();
  const translate = useTranslate();
  const { data: isInitialized, isPending } = useQuery({
    queryKey: ["init"],
    queryFn: async () => {
      return dataProvider.isInitialized();
    },
  });

  const { isPending: isSignUpPending, mutate } = useMutation({
    mutationKey: ["signup"],
    mutationFn: async (data: SignUpData) => {
      return dataProvider.signUp(data);
    },
    onSuccess: (data) => {
      login({
        email: data.email,
        password: data.password,
        redirectTo: "/contacts",
      })
        .then(() => {
          notify("crm.auth.signup.initial_user_created", {
            messageArgs: {
              _: "Initial user successfully created",
            },
          });
          queryClient.invalidateQueries({
            queryKey: ["auth", "canAccess"],
          });
        })
        .catch((err) => {
          if (err.code === "email_not_confirmed") {
            navigate(ConfirmationRequired.path);
          } else {
            notify("crm.auth.sign_in_failed", {
              type: "error",
              messageArgs: {
                _: "Failed to log in.",
              },
            });
            navigate("/login");
          }
        });
    },
    onError: (error) => {
      notify(error.message);
    },
  });

  const login = useLogin();
  const notify = useNotify();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignUpData>({
    mode: "onChange",
  });

  const firstNameLabel = translate("crm.auth.first_name", { _: "First name" });
  const lastNameLabel = translate("crm.auth.last_name", { _: "Last name" });
  const emailLabel = translate("ra.auth.email", { _: "Email" });
  const passwordLabel = translate("ra.auth.password", { _: "Password" });

  const getRequiredMessage = (label: string) => `${label} is required`;
  const getFieldErrorMessage = (message: unknown) =>
    typeof message === "string" ? message : undefined;

  if (isPending) {
    return <LoginSkeleton />;
  }

  if (isInitialized) {
    return <Navigate to="/login" />;
  }

  const onSubmit: SubmitHandler<SignUpData> = async (data) => {
    mutate(data);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06111F] p-8">
      {/* Background glow */}
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
          src={logo}
          alt={title}
          className="h-10 w-auto max-w-[240px] object-contain"
        />
      </div>

      <div className="relative mx-auto mt-12 max-w-md">
        <div className="mb-6 space-y-2 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(77,200,232,0.3)] bg-[rgba(77,200,232,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7DDCF0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4DC8E8] shadow-[0_0_8px_#4DC8E8]" />
            Get started
          </div>
          <h2 className="font-heading text-3xl font-bold tracking-[-0.02em] text-[#ECEEF5]">
            {translate("crm.auth.welcome_title", {
              _: "Welcome to Hatch Theory Solutions",
            })}
          </h2>
          <p className="text-sm text-[rgba(236,238,245,0.6)]">
            {translate("crm.auth.signup.create_first_user", {
              _: "Create the first user account to complete the setup.",
            })}
          </p>
        </div>

        <HatchCard padding="lg">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="first_name">{firstNameLabel}</Label>
                <Input
                  {...register("first_name", {
                    required: getRequiredMessage(firstNameLabel),
                  })}
                  id="first_name"
                  type="text"
                  aria-invalid={errors.first_name ? true : undefined}
                  aria-describedby={
                    errors.first_name ? "first_name-error" : undefined
                  }
                />
                {getFieldErrorMessage(errors.first_name?.message) ? (
                  <p id="first_name-error" className="text-sm text-destructive">
                    {getFieldErrorMessage(errors.first_name?.message)}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="last_name">{lastNameLabel}</Label>
                <Input
                  {...register("last_name", {
                    required: getRequiredMessage(lastNameLabel),
                  })}
                  id="last_name"
                  type="text"
                  aria-invalid={errors.last_name ? true : undefined}
                  aria-describedby={
                    errors.last_name ? "last_name-error" : undefined
                  }
                />
                {getFieldErrorMessage(errors.last_name?.message) ? (
                  <p id="last_name-error" className="text-sm text-destructive">
                    {getFieldErrorMessage(errors.last_name?.message)}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{emailLabel}</Label>
              <Input
                {...register("email", {
                  required: getRequiredMessage(emailLabel),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
                id="email"
                type="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {getFieldErrorMessage(errors.email?.message) ? (
                <p id="email-error" className="text-sm text-destructive">
                  {getFieldErrorMessage(errors.email?.message)}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">{passwordLabel}</Label>
              <Input
                {...register("password", {
                  required: getRequiredMessage(passwordLabel),
                })}
                id="password"
                type="password"
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
              {getFieldErrorMessage(errors.password?.message) ? (
                <p id="password-error" className="text-sm text-destructive">
                  {getFieldErrorMessage(errors.password?.message)}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                disabled={!isValid || isSignUpPending}
                className="w-full bg-[#4DC8E8] font-semibold text-[#06111F] shadow-[0_0_20px_rgba(77,200,232,0.25)] hover:bg-[#7DDCF0]"
              >
                {isSignUpPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {translate("crm.auth.signup.creating", {
                      _: "Creating...",
                    })}
                  </>
                ) : (
                  translate("crm.auth.signup.create_account", {
                    _: "Create account",
                  })
                )}
              </Button>
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
            </div>
          </form>
        </HatchCard>
      </div>
      <Notification />
    </div>
  );
};

SignupPage.path = "/sign-up";
