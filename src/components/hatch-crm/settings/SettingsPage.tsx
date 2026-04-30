/* eslint-disable react-refresh/only-export-components */
import type React from "react";
import { RotateCcw, Save } from "lucide-react";
import type { RaRecord } from "ra-core";
import {
  EditBase,
  Form,
  useGetList,
  useInput,
  useNotify,
  useTranslate,
} from "ra-core";
import { useCallback, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { toSlug } from "@/lib/toSlug";
import { ArrayInput } from "@/components/admin/array-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { SimpleFormIterator } from "@/components/admin/simple-form-iterator";
import { TextInput } from "@/components/admin/text-input";

import ImageEditorField from "../misc/ImageEditorField";
import { HatchPageHeader } from "../_primitives";
import {
  useConfigurationContext,
  useConfigurationUpdater,
  type ConfigurationContextValue,
} from "../root/ConfigurationContext";
import { defaultConfiguration } from "../root/defaultConfiguration";

const SECTIONS = [
  {
    id: "branding",
    label: "crm.settings.sections.branding",
    fallback: "Branding",
  },
  {
    id: "companies",
    label: "resources.companies.name",
    fallback: "Companies",
  },
  { id: "deals", label: "resources.deals.name", fallback: "Deals" },
  { id: "notes", label: "resources.notes.name", fallback: "Notes" },
  { id: "tasks", label: "resources.tasks.name", fallback: "Tasks" },
];

/** Ensure every item in a { value, label } array has a value (slug from label). */
const ensureValues = (items: { value?: string; label: string }[] | undefined) =>
  items?.map((item) => ({ ...item, value: item.value || toSlug(item.label) }));

type ValidateItemsInUseMessages = {
  duplicate?: (displayName: string, duplicates: string[]) => string;
  inUse?: (displayName: string, inUse: string[]) => string;
  validating?: string;
};

/**
 * Validate that no items were removed if they are still referenced by existing deals.
 * Also rejects duplicate slug values.
 * Returns undefined if valid, or an error message string.
 */
export const validateItemsInUse = (
  items: { value: string; label: string }[] | undefined,
  deals: RaRecord[] | undefined,
  fieldName: string,
  displayName: string,
  messages?: ValidateItemsInUseMessages,
) => {
  if (!items) return undefined;
  // Check for duplicate slugs
  const slugs = items.map((i) => i.value || toSlug(i.label));
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const slug of slugs) {
    if (seen.has(slug)) duplicates.add(slug);
    seen.add(slug);
  }
  if (duplicates.size > 0) {
    const duplicatesList = [...duplicates];
    return (
      messages?.duplicate?.(displayName, duplicatesList) ??
      `Duplicate ${displayName}: ${duplicatesList.join(", ")}`
    );
  }
  // Check that no in-use value was removed (skip if deals haven't loaded)
  if (!deals) return messages?.validating ?? "Validating…";
  const values = new Set(slugs);
  const inUse = [
    ...new Set(
      deals
        .filter(
          (deal) => deal[fieldName] && !values.has(deal[fieldName] as string),
        )
        .map((deal) => deal[fieldName] as string),
    ),
  ];
  if (inUse.length > 0) {
    return (
      messages?.inUse?.(displayName, inUse) ??
      `Cannot remove ${displayName} that are still used by deals: ${inUse.join(", ")}`
    );
  }
  return undefined;
};

const getCurrencyChoices = () => {
  const displayNames = new Intl.DisplayNames(
    typeof navigator !== "undefined"
      ? (navigator.languages as string[])
      : ["en"],
    { type: "currency" },
  );
  return Intl.supportedValuesOf("currency").map((code) => ({
    id: code,
    name: `${code} – ${displayNames.of(code)}`,
  }));
};

const transformFormValues = (data: Record<string, any>) => ({
  config: {
    title: data.title,
    lightModeLogo: data.lightModeLogo,
    darkModeLogo: data.darkModeLogo,
    currency: data.currency,
    companySectors: ensureValues(data.companySectors),
    dealCategories: ensureValues(data.dealCategories),
    taskTypes: ensureValues(data.taskTypes),
    dealStages: ensureValues(data.dealStages),
    dealPipelineStatuses: data.dealPipelineStatuses,
    noteStatuses: ensureValues(data.noteStatuses),
  } as ConfigurationContextValue,
});

export const SettingsPage = () => {
  const updateConfiguration = useConfigurationUpdater();
  const notify = useNotify();

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        background: "var(--ink-1)",
      }}
    >
      {/* Page header */}
      <div
        style={{
          padding: "24px 28px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <HatchPageHeader
          eyebrow="Workspace"
          title="Settings"
          subline="Configure your CRM workspace, pipeline, and data fields"
        />
      </div>
      <EditBase
        resource="configuration"
        id={1}
        mutationMode="pessimistic"
        redirect={false}
        transform={transformFormValues}
        mutationOptions={{
          onSuccess: (data: any) => {
            updateConfiguration(data.config);
            notify("crm.settings.saved");
          },
          onError: () => {
            notify("crm.settings.save_error", {
              type: "error",
            });
          },
        }}
      >
        <SettingsForm />
      </EditBase>
    </div>
  );
};

SettingsPage.path = "/settings";

const SettingsForm = () => {
  const config = useConfigurationContext();

  const defaultValues = useMemo(
    () => ({
      title: config.title,
      lightModeLogo: { src: config.lightModeLogo },
      darkModeLogo: { src: config.darkModeLogo },
      currency: config.currency,
      companySectors: config.companySectors,
      dealCategories: config.dealCategories,
      taskTypes: config.taskTypes,
      dealStages: config.dealStages,
      dealPipelineStatuses: config.dealPipelineStatuses,
      noteStatuses: config.noteStatuses,
    }),
    [config],
  );

  return (
    <Form defaultValues={defaultValues}>
      <SettingsFormFields />
    </Form>
  );
};

const SettingsFormFields = () => {
  const translate = useTranslate();
  const currencyChoices = useMemo(() => getCurrencyChoices(), []);
  const {
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useFormContext();

  const dealStages = watch("dealStages");
  const dealPipelineStatuses: string[] = watch("dealPipelineStatuses") ?? [];
  const stageDisplayName = translate("crm.settings.validation.entities.stages");
  const categoryDisplayName = translate(
    "crm.settings.validation.entities.categories",
  );

  const { data: deals } = useGetList("deals", {
    pagination: { page: 1, perPage: 1000 },
  });

  const validateDealStages = useCallback(
    (stages: { value: string; label: string }[] | undefined) =>
      validateItemsInUse(stages, deals, "stage", stageDisplayName, {
        duplicate: (displayName, duplicates) =>
          translate("crm.settings.validation.duplicate", {
            display_name: displayName,
            items: duplicates.join(", "),
          }),
        inUse: (displayName, inUse) =>
          translate("crm.settings.validation.in_use", {
            display_name: displayName,
            items: inUse.join(", "),
          }),
        validating: translate("crm.settings.validation.validating"),
      }),
    [deals, stageDisplayName, translate],
  );

  const validateDealCategories = useCallback(
    (categories: { value: string; label: string }[] | undefined) =>
      validateItemsInUse(categories, deals, "category", categoryDisplayName, {
        duplicate: (displayName, duplicates) =>
          translate("crm.settings.validation.duplicate", {
            display_name: displayName,
            items: duplicates.join(", "),
          }),
        inUse: (displayName, inUse) =>
          translate("crm.settings.validation.in_use", {
            display_name: displayName,
            items: inUse.join(", "),
          }),
        validating: translate("crm.settings.validation.validating"),
      }),
    [categoryDisplayName, deals, translate],
  );

  return (
    <div style={{ display: "flex", gap: 0, flex: 1, minHeight: 0 }}>
      {/* Left navigation */}
      <nav
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.07)",
          padding: "28px 0",
        }}
      >
        <div
          style={{
            padding: "0 20px 16px",
            fontSize: 9.5,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--fg-4)",
            fontWeight: 700,
          }}
        >
          Configuration
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: "0 10px",
          }}
        >
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() =>
                document
                  .getElementById(section.id)
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 7,
                color: "var(--fg-2)",
                background: "transparent",
                border: "1px solid transparent",
                fontSize: 13,
                fontWeight: 500,
                textAlign: "left",
                cursor: "pointer",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.03)";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--fg-1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--fg-2)";
              }}
            >
              {translate(section.label, {
                smart_count: 2,
                _: section.fallback,
              })}
            </button>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          padding: "28px 40px 120px",
        }}
      >
        {/* Branding */}
        <SettingsPanel
          id="branding"
          eyebrow="Appearance"
          title={translate("crm.settings.sections.branding")}
        >
          <TextInput source="title" label="crm.settings.app_title" />
          <div style={{ display: "flex", gap: 32, marginTop: 8 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <p
                style={{ margin: 0, fontSize: 12, color: "var(--fg-2-muted)" }}
              >
                {translate("crm.settings.light_mode_logo")}
              </p>
              <ImageEditorField
                source="lightModeLogo"
                width={100}
                height={100}
                linkPosition="bottom"
                backgroundImageColor="#f5f5f5"
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <p
                style={{ margin: 0, fontSize: 12, color: "var(--fg-2-muted)" }}
              >
                {translate("crm.settings.dark_mode_logo")}
              </p>
              <ImageEditorField
                source="darkModeLogo"
                width={100}
                height={100}
                linkPosition="bottom"
                backgroundImageColor="var(--neutral-900)"
              />
            </div>
          </div>
        </SettingsPanel>

        {/* Companies */}
        <SettingsPanel
          id="companies"
          eyebrow="Data"
          title={translate("resources.companies.name", { smart_count: 2 })}
        >
          <SettingsSubheading>
            {translate("crm.settings.companies.sectors")}
          </SettingsSubheading>
          <ArrayInput source="companySectors" label={false} helperText={false}>
            <SimpleFormIterator disableReordering disableClear>
              <TextInput
                source="label"
                label={false}
                aria-label={translate("crm.settings.companies.sectors")}
              />
            </SimpleFormIterator>
          </ArrayInput>
        </SettingsPanel>

        {/* Deals */}
        <SettingsPanel
          id="deals"
          eyebrow="Pipeline"
          title={translate("resources.deals.name", { smart_count: 2 })}
        >
          <SettingsSubheading>
            {translate("crm.settings.deals.currency")}
          </SettingsSubheading>
          <AutocompleteInput
            source="currency"
            label={false}
            aria-label={translate("crm.settings.deals.currency")}
            choices={currencyChoices}
            inputText={(choice) => choice?.id}
            modal
          />

          <SettingsDivider />

          <SettingsSubheading>
            {translate("crm.settings.deals.stages")}
          </SettingsSubheading>
          <ArrayInput
            source="dealStages"
            label={false}
            helperText={false}
            validate={validateDealStages}
          >
            <SimpleFormIterator disableClear>
              <TextInput
                source="label"
                label={false}
                aria-label={translate("crm.settings.deals.stages")}
              />
            </SimpleFormIterator>
          </ArrayInput>

          <SettingsDivider />

          <SettingsSubheading>
            {translate("crm.settings.deals.pipeline_statuses")}
          </SettingsSubheading>
          <p
            style={{
              margin: "4px 0 12px",
              fontSize: 12,
              color: "var(--fg-2-muted)",
            }}
          >
            {translate("crm.settings.deals.pipeline_help")}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {dealStages?.map(
              (stage: { value: string; label: string }, idx: number) => {
                const isSelected = dealPipelineStatuses.includes(stage.value);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setValue(
                          "dealPipelineStatuses",
                          dealPipelineStatuses.filter((s) => s !== stage.value),
                        );
                      } else {
                        setValue("dealPipelineStatuses", [
                          ...dealPipelineStatuses,
                          stage.value,
                        ]);
                      }
                    }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 7,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      background: isSelected
                        ? "var(--hatch-cyan)"
                        : "rgba(255,255,255,0.04)",
                      color: isSelected ? "var(--hatch-ink)" : "var(--fg-2)",
                      border: isSelected
                        ? "1px solid transparent"
                        : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {stage.label || stage.value}
                  </button>
                );
              },
            )}
          </div>

          <SettingsDivider />

          <SettingsSubheading>
            {translate("crm.settings.deals.categories")}
          </SettingsSubheading>
          <ArrayInput
            source="dealCategories"
            label={false}
            helperText={false}
            validate={validateDealCategories}
          >
            <SimpleFormIterator disableReordering disableClear>
              <TextInput
                source="label"
                label={false}
                aria-label={translate("crm.settings.deals.categories")}
              />
            </SimpleFormIterator>
          </ArrayInput>
        </SettingsPanel>

        {/* Notes */}
        <SettingsPanel
          id="notes"
          eyebrow="Notes"
          title={translate("resources.notes.name", { smart_count: 2 })}
        >
          <SettingsSubheading>
            {translate("crm.settings.notes.statuses")}
          </SettingsSubheading>
          <ArrayInput source="noteStatuses" label={false} helperText={false}>
            <SimpleFormIterator inline disableReordering disableClear>
              <TextInput
                source="label"
                label={false}
                aria-label={translate("crm.settings.notes.statuses")}
                className="flex-1"
              />
              <ColorInput source="color" />
            </SimpleFormIterator>
          </ArrayInput>
        </SettingsPanel>

        {/* Tasks */}
        <SettingsPanel
          id="tasks"
          eyebrow="Tasks"
          title={translate("resources.tasks.name", { smart_count: 2 })}
        >
          <SettingsSubheading>
            {translate("crm.settings.tasks.types")}
          </SettingsSubheading>
          <ArrayInput source="taskTypes" label={false} helperText={false}>
            <SimpleFormIterator disableReordering disableClear>
              <TextInput
                source="label"
                label={false}
                aria-label={translate("crm.settings.tasks.types")}
              />
            </SimpleFormIterator>
          </ArrayInput>
        </SettingsPanel>
      </div>

      {/* Sticky save bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "var(--ink-1)",
          padding: "14px 40px 14px calc(220px + 40px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            maxWidth: 680,
          }}
        >
          <button
            type="button"
            onClick={() =>
              reset({
                ...defaultConfiguration,
                lightModeLogo: { src: defaultConfiguration.lightModeLogo },
                darkModeLogo: { src: defaultConfiguration.darkModeLogo },
              })
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.07)",
              background: "transparent",
              color: "var(--fg-2-muted)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <RotateCcw size={14} />
            {translate("crm.settings.reset_defaults")}
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => window.history.back()}
              style={{
                padding: "9px 18px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent",
                color: "var(--fg-2)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {translate("ra.action.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 20px",
                borderRadius: 8,
                background: isSubmitting
                  ? "rgba(77,200,232,0.5)"
                  : "var(--hatch-cyan)",
                color: "var(--hatch-ink)",
                fontSize: 13,
                fontWeight: 700,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                border: "none",
              }}
            >
              <Save size={14} />
              {isSubmitting
                ? translate("crm.settings.saving")
                : translate("ra.action.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsPanel = ({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) => (
  <div
    id={id}
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
        {eyebrow}
      </div>
      <h2
        className="font-heading"
        style={{
          margin: 0,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: "var(--fg-1)",
        }}
      >
        {title}
      </h2>
    </div>
    {children}
  </div>
);

const SettingsSubheading = ({ children }: { children: React.ReactNode }) => (
  <h3
    style={{
      margin: "0 0 8px",
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--fg-2)",
    }}
  >
    {children}
  </h3>
);

const SettingsDivider = () => (
  <div
    style={{
      height: 1,
      background: "rgba(255,255,255,0.06)",
      margin: "20px 0",
    }}
  />
);

/** A minimal color picker input compatible with ra-core's useInput. */
const ColorInput = ({ source }: { source: string }) => {
  const { field } = useInput({ source });
  const translate = useTranslate();
  return (
    <input
      type="color"
      aria-label={translate("crm.settings.notes.status_color", {
        _: "Note status color",
      })}
      {...field}
      value={field.value || "#000000"}
      className="w-9 h-9 shrink-0 cursor-pointer appearance-none rounded border bg-transparent p-0.5 [&::-webkit-color-swatch-wrapper]:cursor-pointer [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:cursor-pointer [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-none [&::-moz-color-swatch]:cursor-pointer [&::-moz-color-swatch]:rounded-sm [&::-moz-color-swatch]:border-none"
    />
  );
};
