import { Suspense, useState, type ErrorInfo, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { Notification } from "@/components/admin/notification";
import { Error } from "@/components/admin/error";
import { Loading } from "@/components/admin/loading";
import { useConfigurationLoader } from "../root/useConfigurationLoader";
import Header from "./Header";

export const Layout = ({ children }: { children: ReactNode }) => {
  useConfigurationLoader();
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | undefined>(undefined);
  const handleError = (_: unknown, info: ErrorInfo) => {
    setErrorInfo(info);
  };
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--ink-1)",
      }}
    >
      <AppSidebar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <Header />
        <ErrorBoundary
          onError={handleError}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <Error
              error={error}
              errorInfo={errorInfo}
              resetErrorBoundary={resetErrorBoundary}
            />
          )}
        >
          <Suspense fallback={<Loading />}>
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
              }}
            >
              {children}
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>
      <Notification />
    </div>
  );
};
