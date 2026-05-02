/* eslint-disable max-lines */
import type {
  CoreAdminProps,
  AuthProvider,
  DashboardComponent,
  LayoutComponent,
} from "ra-core";
import { CustomRoutes, localStorageStore, Resource } from "ra-core";
import { lazy, Suspense, type ReactNode, useEffect, useMemo } from "react";
import { Route, Navigate } from "react-router";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { Admin } from "@/components/admin/admin";
import { ForgotPasswordPage } from "@/components/supabase/forgot-password-page";
import { SetPasswordPage } from "@/components/supabase/set-password-page";
import { OAuthConsentPage } from "@/components/supabase/oauth-consent-page";

import companies from "../companies";
import contacts from "../contacts";
import { Dashboard } from "../dashboard/Dashboard";
import { MobileDashboard } from "../dashboard/MobileDashboard";
import deals from "../deals";
import { Layout } from "../layout/Layout";
import { MobileLayout } from "../layout/MobileLayout";
import { SignupPage } from "../login/SignupPage";
import { ConfirmationRequired } from "../login/ConfirmationRequired";
import {
  getAuthProvider as supabaseAuthProviderBuilder,
  getDataProvider as supabaseDataProviderBuilder,
} from "../providers/supabase";
import integrationLog from "../integration-log";
import sales from "../sales";
import {
  CONFIGURATION_STORE_KEY,
  type ConfigurationContextValue,
} from "./ConfigurationContext";
import type { CrmDataProvider } from "../providers/types";
import {
  defaultCompanySectors,
  defaultCurrency,
  defaultDarkModeLogo,
  defaultDealCategories,
  defaultDealPipelineStatuses,
  defaultDealStages,
  defaultLightModeLogo,
  defaultNoteStatuses,
  defaultTaskTypes,
  defaultTitle,
} from "./defaultConfiguration";
import { i18nProvider as defaulti18nProvider } from "../providers/commons/i18nProvider";
import { StartPage } from "../login/StartPage.tsx";
import { useIsMobile } from "@/hooks/use-mobile.ts";
import { ContactListMobile } from "../contacts/ContactList.tsx";
import { ContactShow } from "../contacts/ContactShow.tsx";
import { CompanyShow } from "../companies/CompanyShow.tsx";

const ImportPage = lazy(() =>
  import("../misc/ImportPage").then((module) => ({
    default: module.ImportPage,
  })),
);
const SettingsPageMobile = lazy(() =>
  import("../settings/SettingsPageMobile").then((module) => ({
    default: module.SettingsPageMobile,
  })),
);
const ProfilePage = lazy(() =>
  import("../settings/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  })),
);
const SettingsPage = lazy(() =>
  import("../settings/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  })),
);
const ReportsPage = lazy(() =>
  import("../reports/ReportsPage").then((module) => ({
    default: module.ReportsPage,
  })),
);
const DeliveryDashboard = lazy(() =>
  import("../dashboard/DeliveryDashboard").then((module) => ({
    default: module.DeliveryDashboard,
  })),
);
const IntakeList = lazy(() =>
  import("../intake/IntakeList").then((module) => ({
    default: module.IntakeList,
  })),
);
const ResourcesPage = lazy(() =>
  import("../resources/ResourcesPage").then((module) => ({
    default: module.ResourcesPage,
  })),
);
const MobileTasksList = lazy(() =>
  import("../tasks/MobileTasksList.tsx").then((module) => ({
    default: module.MobileTasksList,
  })),
);
const TasksPage = lazy(() =>
  import("../tasks/TasksPage.tsx").then((module) => ({
    default: module.TasksPage,
  })),
);
const CompanyListMobile = lazy(() =>
  import("../companies/CompanyListMobile.tsx").then((module) => ({
    default: module.CompanyListMobile,
  })),
);
const DealListMobile = lazy(() =>
  import("../deals/DealListMobile.tsx").then((module) => ({
    default: module.DealListMobile,
  })),
);
const NoteShowPage = lazy(() =>
  import("../notes/NoteShowPage.tsx").then((module) => ({
    default: module.NoteShowPage,
  })),
);

const lazyRouteElement = (component: ReactNode) => (
  <Suspense fallback={null}>{component}</Suspense>
);

const defaultStore = localStorageStore(undefined, "CRM");
const MOBILE_QUERY_CACHE_STORAGE_KEY = "HATCH_CRM_MOBILE_QUERY_CACHE";

export type CRMProps = {
  dataProvider?: CrmDataProvider;
  authProvider?: AuthProvider;
  i18nProvider?: CoreAdminProps["i18nProvider"];
  store?: CoreAdminProps["store"];
  dashboard?: DashboardComponent;
  layout?: LayoutComponent;
} & Partial<ConfigurationContextValue>;

/**
 * CRM Component
 *
 * This component sets up and renders the main CRM application using `ra-core`. It provides
 * default configurations and themes but allows for customization through props. The component
 * seeds the store with any custom prop values for backwards compatibility.
 *
 * @param {LabeledValue[]} companySectors - The list of company sectors used in the application.
 * @param {string} currency - The ISO 4217 currency code used to format monetary values (e.g. "USD", "EUR", "GBP").
 * @param {RaThemeOptions} darkTheme - The theme to use when the application is in dark mode.
 * @param {LabeledValue[]} dealCategories - The categories of deals used in the application.
 * @param {string[]} dealPipelineStatuses - The statuses of deals in the pipeline used in the application.
 * @param {DealStage[]} dealStages - The stages of deals used in the application.
 * @param {RaThemeOptions} lightTheme - The theme to use when the application is in light mode.
 * @param {string} logo - The logo used in the CRM application.
 * @param {NoteStatus[]} noteStatuses - The statuses of notes used in the application.
 * @param {LabeledValue[]} taskTypes - The types of tasks used in the application.
 * @param {string} title - The title of the CRM application.
 *
 * @returns {JSX.Element} The rendered CRM application.
 *
 * @example
 * // Basic usage of the CRM component
 * import { CRM } from '@/components/hatch-crm/dashboard/CRM';
 *
 * const App = () => (
 *     <CRM
 *         logo="/path/to/logo.png"
 *         title="My Custom CRM"
 *         lightTheme={{
 *             ...defaultTheme,
 *             palette: {
 *                 primary: { main: '#0000ff' },
 *             },
 *         }}
 *     />
 * );
 *
 * export default App;
 */
export const CRM = ({
  companySectors = defaultCompanySectors,
  currency = defaultCurrency,
  dealCategories = defaultDealCategories,
  dealPipelineStatuses = defaultDealPipelineStatuses,
  dealStages = defaultDealStages,
  darkModeLogo = defaultDarkModeLogo,
  lightModeLogo = defaultLightModeLogo,
  noteStatuses = defaultNoteStatuses,
  taskTypes = defaultTaskTypes,
  title = defaultTitle,
  dataProvider: dataProviderProp,
  authProvider: authProviderProp,
  i18nProvider = defaulti18nProvider,
  store = defaultStore,
  googleWorkplaceDomain = import.meta.env.VITE_GOOGLE_WORKPLACE_DOMAIN,
  disableEmailPasswordAuthentication = import.meta.env
    .VITE_DISABLE_EMAIL_PASSWORD_AUTHENTICATION === "true",
  ...rest
}: CRMProps) => {
  const dataProvider = useMemo(
    () => dataProviderProp ?? supabaseDataProviderBuilder(),
    [dataProviderProp],
  );
  const authProvider = useMemo(
    () => authProviderProp ?? supabaseAuthProviderBuilder(),
    [authProviderProp],
  );

  // Seed the store with CRM prop values if not already stored
  // (backwards compatibility for prop-based config)
  useEffect(() => {
    if (!store.getItem(CONFIGURATION_STORE_KEY)) {
      store.setItem(CONFIGURATION_STORE_KEY, {
        companySectors,
        currency,
        dealCategories,
        dealPipelineStatuses,
        dealStages,
        noteStatuses,
        taskTypes,
        title,
        darkModeLogo,
        lightModeLogo,
        googleWorkplaceDomain,
        disableEmailPasswordAuthentication,
      } satisfies ConfigurationContextValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  const isMobile = useIsMobile();

  // on login, pre-fetch the configuration to avoid a flickering
  // when accessing the app for the first time
  const wrappedAuthProvider = useMemo<AuthProvider>(
    () => ({
      ...authProvider,
      login: async (params: any) => {
        const result = await authProvider.login(params);
        try {
          const config = await dataProvider.getConfiguration();
          if (Object.keys(config).length > 0) {
            store.setItem(CONFIGURATION_STORE_KEY, config);
          }
        } catch {
          // Non-critical: config will load via useConfigurationLoader
        }
        return result;
      },
      handleCallback: async (params: any) => {
        if (!authProvider.handleCallback) {
          throw new Error(
            "handleCallback is not implemented in the authProvider",
          );
        }
        const result = await authProvider.handleCallback(params);
        try {
          const config = await dataProvider.getConfiguration();
          if (Object.keys(config).length > 0) {
            store.setItem(CONFIGURATION_STORE_KEY, config);
          }
        } catch {
          // Non-critical: config will load via useConfigurationLoader
        }
        return result;
      },
      logout: async (params: any) => {
        try {
          store.removeItem(CONFIGURATION_STORE_KEY);
        } catch {
          // Ignore
        }
        return authProvider.logout(params);
      },
    }),
    [authProvider, dataProvider, store],
  );

  const ResponsiveAdmin = isMobile ? MobileAdmin : DesktopAdmin;

  return (
    <ResponsiveAdmin
      dataProvider={dataProvider}
      authProvider={wrappedAuthProvider}
      i18nProvider={i18nProvider}
      store={store}
      loginPage={StartPage}
      requireAuth
      disableTelemetry
      {...rest}
    />
  );
};

const DesktopAdmin = (
  props: CoreAdminProps & {
    dashboard?: DashboardComponent;
    layout?: LayoutComponent;
  },
) => {
  return (
    <Admin
      layout={props.layout ?? Layout}
      dashboard={props.dashboard ?? Dashboard}
      {...props}
    >
      <CustomRoutes noLayout>
        <Route path={SignupPage.path} element={<SignupPage />} />
        <Route
          path={ConfirmationRequired.path}
          element={<ConfirmationRequired />}
        />
        <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
        <Route
          path={ForgotPasswordPage.path}
          element={<ForgotPasswordPage />}
        />
        <Route path={OAuthConsentPage.path} element={<OAuthConsentPage />} />
      </CustomRoutes>

      <CustomRoutes>
        <Route path="/profile" element={lazyRouteElement(<ProfilePage />)} />
        <Route path="/settings" element={lazyRouteElement(<SettingsPage />)} />
        <Route path="/import" element={lazyRouteElement(<ImportPage />)} />
        <Route path="/reports" element={lazyRouteElement(<ReportsPage />)} />
        <Route
          path="/delivery"
          element={lazyRouteElement(<DeliveryDashboard />)}
        />
        <Route
          path="/resources"
          element={lazyRouteElement(<ResourcesPage />)}
        />
        <Route
          path="/intake"
          element={<Navigate to="/intake_leads" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </CustomRoutes>
      <Resource name="deals" {...deals} />
      <Resource name="contacts" {...contacts} />
      <Resource name="companies" {...companies} />
      <Resource name="contact_notes" />
      <Resource name="deal_notes" />
      <Resource name="tasks" list={TasksPage} />
      <Resource name="sales" {...sales} />
      <Resource name="intake_leads" list={IntakeList} />
      <Resource name="outreach_steps" />
      <Resource name="resources" />
      <Resource name="tags" />
      <Resource name="trade_types" />
      <Resource name="lead_sources" />
      <Resource name="contact_tags" />
      <Resource name="deal_contacts" />
      <Resource name="integration_log" {...integrationLog} />
    </Admin>
  );
};

const MobileAdmin = (
  props: CoreAdminProps & {
    dashboard?: DashboardComponent;
    layout?: LayoutComponent;
  },
) => {
  const mobileQueryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            networkMode: "offlineFirst",
          },
          mutations: {
            networkMode: "offlineFirst",
          },
        },
      }),
    [],
  );
  const mobileAsyncStoragePersister = useMemo(
    () =>
      createAsyncStoragePersister({
        key: MOBILE_QUERY_CACHE_STORAGE_KEY,
        storage: localStorage,
      }),
    [],
  );
  const mobileAuthProvider = useMemo<AuthProvider | undefined>(() => {
    const authProvider = props.authProvider as AuthProvider | undefined;
    if (!authProvider) {
      return undefined;
    }
    return {
      ...authProvider,
      logout: async (params: any) => {
        mobileQueryClient.clear();
        await mobileAsyncStoragePersister.removeClient();
        return authProvider.logout(params);
      },
    };
  }, [mobileAsyncStoragePersister, mobileQueryClient, props.authProvider]);

  return (
    <PersistQueryClientProvider
      client={mobileQueryClient}
      persistOptions={{ persister: mobileAsyncStoragePersister }}
    >
      <Admin
        queryClient={mobileQueryClient}
        layout={props.layout ?? MobileLayout}
        dashboard={props.dashboard ?? MobileDashboard}
        {...props}
        authProvider={mobileAuthProvider}
      >
        <CustomRoutes noLayout>
          <Route path={SignupPage.path} element={<SignupPage />} />
          <Route
            path={ConfirmationRequired.path}
            element={<ConfirmationRequired />}
          />
          <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
          <Route
            path={ForgotPasswordPage.path}
            element={<ForgotPasswordPage />}
          />
          <Route path={OAuthConsentPage.path} element={<OAuthConsentPage />} />
        </CustomRoutes>
        <CustomRoutes>
          <Route
            path="/settings"
            element={lazyRouteElement(<SettingsPageMobile />)}
          />
          <Route path="/reports" element={lazyRouteElement(<ReportsPage />)} />
          <Route
            path="/delivery"
            element={lazyRouteElement(<DeliveryDashboard />)}
          />
          <Route
            path="/resources"
            element={lazyRouteElement(<ResourcesPage />)}
          />
          <Route
            path="/intake"
            element={<Navigate to="/intake_leads" replace />}
          />
        </CustomRoutes>
        <Resource
          name="contacts"
          list={ContactListMobile}
          show={ContactShow}
          recordRepresentation={contacts.recordRepresentation}
        >
          <Route
            path=":id/notes/:noteId"
            element={lazyRouteElement(<NoteShowPage />)}
          />
        </Resource>
        <Resource name="deals" list={DealListMobile} />
        <Resource
          name="companies"
          list={CompanyListMobile}
          show={CompanyShow}
        />
        <Resource name="intake_leads" list={IntakeList} />
        <Resource name="outreach_steps" />
        <Resource name="tasks" list={MobileTasksList} />
        <Resource name="tags" />
        <Resource name="trade_types" />
        <Resource name="lead_sources" />
        <Resource name="sales" />
      </Admin>
    </PersistQueryClientProvider>
  );
};
