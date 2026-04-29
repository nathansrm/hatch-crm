import { RecordContextProvider, useListContext, useTranslate } from "ra-core";

import type { Company } from "../types";
import { CompanyCard } from "./CompanyCard";

const times = (nbChildren: number, fn: (key: number) => any) =>
  Array.from({ length: nbChildren }, (_, key) => fn(key));

const LoadingGridList = () => (
  <div className="flex flex-wrap w-full gap-1">
    {times(15, (key) => (
      <div
        className="h-[200px] w-[230px] flex flex-col"
        key={key}
        style={{ background: "var(--ink-5)" }}
      />
    ))}
  </div>
);

const LoadedGridList = () => {
  const { data, error, isPending } = useListContext<Company>();
  const translate = useTranslate();

  if (isPending || error) return null;

  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 14,
      }}
    >
      {data.map((record) => (
        <RecordContextProvider key={record.id} value={record}>
          <CompanyCard />
        </RecordContextProvider>
      ))}

      {data.length === 0 && (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "var(--fg-3)",
            fontSize: 13,
          }}
        >
          {translate("resources.companies.empty.title", {
            _: "No companies found",
          })}
        </div>
      )}
    </div>
  );
};

export const ImageList = () => {
  const { isPending } = useListContext();
  return isPending ? <LoadingGridList /> : <LoadedGridList />;
};
