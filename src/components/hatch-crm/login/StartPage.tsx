import { useQuery } from "@tanstack/react-query";
import { useDataProvider } from "ra-core";
import { Navigate, useLocation } from "react-router-dom";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { CrmDataProvider } from "../providers/types";
import { LoginSkeleton } from "./LoginSkeleton";
import { LoginPage } from "./LoginPage";
import { resolveStartPageState } from "./startPageState";

export const StartPage = () => {
  const dataProvider = useDataProvider<CrmDataProvider>();
  const { disableEmailPasswordAuthentication } = useConfigurationContext();
  const location = useLocation();
  const isExplicitLoginRoute = location.pathname === "/login";
  const {
    data: isInitialized,
    error,
    isPending,
  } = useQuery({
    queryKey: ["init"],
    queryFn: async () => {
      return dataProvider.isInitialized();
    },
  });

  const state = resolveStartPageState({
    isPending,
    hasError: Boolean(error),
    isExplicitLoginRoute,
    isInitialized,
    disableEmailPasswordAuthentication,
  });

  if (state === "loading") return <LoginSkeleton />;
  if (state === "login") return <LoginPage />;

  return <Navigate to="/sign-up" replace />;
};
