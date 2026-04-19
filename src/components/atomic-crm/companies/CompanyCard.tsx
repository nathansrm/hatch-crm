import { Link } from "react-router";
import {
  useCreatePath,
  useListContext,
  useRecordContext,
  useReference,
  useTranslate,
} from "ra-core";
import { ReferenceManyField } from "@/components/admin/reference-many-field";

import { Avatar as ContactAvatar } from "../contacts/Avatar";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Company } from "../types";

export const CompanyCard = (props: { record?: Company }) => {
  const createPath = useCreatePath();
  const record = useRecordContext<Company>(props);
  const translate = useTranslate();
  const { companySectors } = useConfigurationContext();
  const { referenceRecord, isLoading } = useReference<{ id: string; name: string }>({
    reference: "trade_types",
    id: record?.trade_type_id ?? "",
  });
  if (!record) return null;

  const sector = companySectors.find((s) => s.value === record.sector);
  const sectorLabel = sector?.label;
  const subtitle =
    !record.trade_type_id || isLoading || !referenceRecord
      ? sectorLabel
      : referenceRecord.name;

  return (
    <Link
      to={createPath({
        resource: "companies",
        id: record.id,
        type: "show",
      })}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          borderRadius: 12,
          padding: "18px 20px",
          background: "#0D1424",
          border: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          transition: "all 0.15s",
          cursor: "pointer",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#111A2E";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#0D1424";
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "rgba(77,200,232,0.12)",
              border: "1px solid rgba(77,200,232,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: '"Manrope Variable", ui-sans-serif',
              fontWeight: 800,
              fontSize: 14,
              color: "#4DC8E8",
            }}
          >
            {record.name
              .split(" ")
              .map((w: string) => w[0])
              .slice(0, 2)
              .join("")}
          </div>
          {record.nb_deals != null && record.nb_deals > 0 && (
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#34D399",
                background: "rgba(52,211,153,0.1)",
                border: "1px solid rgba(52,211,153,0.25)",
                padding: "3px 8px",
                borderRadius: 4,
              }}
            >
              Active
            </span>
          )}
        </div>
        <div
          style={{
            fontFamily: '"Manrope Variable", ui-sans-serif',
            fontSize: 15,
            fontWeight: 700,
            color: "#ECEEF5",
            marginBottom: 3,
            letterSpacing: "-0.01em",
          }}
        >
          {record.name}
        </div>
        <div style={{ fontSize: 12, color: "#5C6784", marginBottom: 12 }}>
          {subtitle}
        </div>
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.07)",
            marginBottom: 12,
          }}
        />
        <div style={{ display: "flex", gap: 20 }}>
          {record.nb_deals != null && (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span
                aria-label={translate("resources.deals.name", {
                  smart_count: record.nb_deals,
                  _: "Deals",
                })}
                style={{
                  fontSize: 9.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#5C6784",
                  fontWeight: 700,
                }}
              >
                Deals
              </span>
              <span
                style={{
                  fontFamily: '"Manrope Variable", ui-sans-serif',
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#ECEEF5",
                }}
              >
                {record.nb_deals}
              </span>
            </div>
          )}
          {record.nb_contacts != null && (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span
                aria-label={translate("resources.contacts.name", {
                  smart_count: record.nb_contacts,
                  _: "Contacts",
                })}
                style={{
                  fontSize: 9.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#5C6784",
                  fontWeight: 700,
                }}
              >
                Contacts
              </span>
              <span
                style={{
                  fontFamily: '"Manrope Variable", ui-sans-serif',
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#ECEEF5",
                }}
              >
                {record.nb_contacts}
              </span>
            </div>
          )}
        </div>
        {record.nb_contacts ? (
          <div style={{ marginTop: 12 }}>
            <ReferenceManyField reference="contacts" target="company_id">
              <AvatarGroupIterator />
            </ReferenceManyField>
          </div>
        ) : null}
      </div>
    </Link>
  );
};

const AvatarGroupIterator = () => {
  const { data, total, error, isPending } = useListContext();
  if (isPending || error) return null;

  const MAX_AVATARS = 3;
  return (
    <div className="*:data-[slot=avatar]:ring-background flex -space-x-0.5 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale-50">
      {data.slice(0, MAX_AVATARS).map((record: any) => (
        <ContactAvatar
          key={record.id}
          record={record}
          width={25}
          height={25}
          title={`${record.first_name} ${record.last_name}`}
        />
      ))}
      {total > MAX_AVATARS && (
        <span
          className="relative flex size-8 shrink-0 overflow-hidden rounded-full w-[25px] h-[25px]"
          data-slot="avatar"
        >
          <span className="bg-muted flex size-full items-center justify-center rounded-full text-[10px]">
            +{total - MAX_AVATARS}
          </span>
        </span>
      )}
    </div>
  );
};
