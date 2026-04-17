import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useDataProvider, useLogin, useNotify, useTranslate } from "ra-core";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Navigate, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    lightModeLogo: logo,
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
          // FIXME: We should probably provide a hook for that in the ra-core package
          queryClient.invalidateQueries({
            queryKey: ["auth", "canAccess"],
          });
        })
        .catch((err) => {
          if (err.code === "email_not_confirmed") {
            // An email confirmation is required to continue.
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

  const firstNameLabel = translate("crm.auth.first_name", {
    _: "First name",
  });
  const lastNameLabel = translate("crm.auth.last_name", {
    _: "Last name",
  });
  const emailLabel = translate("ra.auth.email", {
    _: "Email",
  });
  const passwordLabel = translate("ra.auth.password", {
    _: "Password",
  });

  const getRequiredMessage = (label: string) => `${label} is required`;
  const getFieldErrorMessage = (message: unknown) =>
    typeof message === "string" ? message : undefined;

  if (isPending) {
    return <LoginSkeleton />;
  }

  // For the moment, we only allow one user to sign up. Other users must be created by the administrator.
  if (isInitialized) {
    return <Navigate to="/login" />;
  }

  const onSubmit: SubmitHandler<SignUpData> = async (data) => {
    mutate(data);
  };

  return (
    <div className="h-screen p-8">
      <div className="flex items-center gap-4">
        <img src={logo} alt={title} width={24} />
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      <div className="h-full">
        <div className="max-w-sm mx-auto h-full flex flex-col justify-center gap-4">
          <h1 className="text-2xl font-bold mb-4">
            {translate("crm.auth.welcome_title", {
              _: "Welcome to Hatch CRM",
            })}
          </h1>
          <p className="text-base mb-4">
            {translate("crm.auth.signup.create_first_user", {
              _: "Create the first user account to complete the setup.",
            })}
          </p>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
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
            <div className="flex flex-col gap-4 justify-between items-center mt-8">
              <Button
                type="submit"
                disabled={!isValid || isSignUpPending}
                className="w-full"
              >
                {isSignUpPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
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
        </div>
      </div>
      <Notification />
    </div>
  );
};

SignupPage.path = "/sign-up";
