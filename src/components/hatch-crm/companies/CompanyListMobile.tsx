import {
  InfiniteListBase,
  RecordContextProvider,
  useGetIdentity,
  useListContext,
} from "ra-core";

import MobileHeader from "../layout/MobileHeader";
import { MobileContent } from "../layout/MobileContent";
import { MobileAppHeader, MobileAvatar } from "../layout/MobileChrome";
import { InfinitePagination } from "../misc/InfinitePagination";
import type { Company } from "../types";
import { CompanyCard } from "./CompanyCard";

export const CompanyListMobile = () => {
  const { identity } = useGetIdentity();
  if (!identity) return null;

  return (
    <InfiniteListBase
      perPage={25}
      sort={{ field: "name", order: "ASC" }}
      queryOptions={{
        onError: () => {
          /* Disable error notification as CompanyListLayoutMobile handles it */
        },
      }}
    >
      <CompanyListLayoutMobile />
    </InfiniteListBase>
  );
};

const CompanyListLayoutMobile = () => {
  const { isPending, data, error, total } = useListContext<Company>();

  return (
    <div>
      <MobileHeader>
        <MobileAppHeader
          title="Companies"
          subtitle={`${total ?? 0} accounts`}
          actions={<MobileAvatar label="N" />}
        />
      </MobileHeader>
      <MobileContent>
        {!isPending && !data?.length ? (
          <div className="py-6 text-sm text-muted-foreground">
            No companies yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {data?.map((company) => (
              <RecordContextProvider key={company.id} value={company}>
                <CompanyCard />
              </RecordContextProvider>
            ))}
          </div>
        )}
        {!error && (
          <div className="flex justify-center">
            <InfinitePagination />
          </div>
        )}
      </MobileContent>
    </div>
  );
};
