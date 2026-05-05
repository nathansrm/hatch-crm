type StartPageState = "loading" | "login" | "signup";

export function resolveStartPageState({
  isPending,
  hasError,
  isExplicitLoginRoute,
  isInitialized,
  disableEmailPasswordAuthentication,
}: {
  isPending: boolean;
  hasError: boolean;
  isExplicitLoginRoute: boolean;
  isInitialized: boolean | undefined;
  disableEmailPasswordAuthentication: boolean | undefined;
}): StartPageState {
  if (isPending) return "loading";
  if (hasError) return "login";
  if (isExplicitLoginRoute) return "login";
  if (isInitialized) return "login";
  if (disableEmailPasswordAuthentication) return "login";

  return "signup";
}
