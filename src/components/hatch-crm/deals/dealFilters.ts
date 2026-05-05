import {
  DASHBOARD_COLLECTION_PAGINATION,
  isTerminalDealStage,
  UNARCHIVED_DEALS_LIST_PARAMS,
} from "../dashboard/widgets/dashboardUtils";

export const OPEN_DEALS_FILTER = {
  "archived_at@is": null,
  "stage@not.in": "(won,lost)",
} as const;

export const OPEN_DEALS_LIST_PARAMS = {
  pagination: DASHBOARD_COLLECTION_PAGINATION,
  filter: OPEN_DEALS_FILTER,
} as const;

export const isOpenDeal = (deal: {
  archived_at?: string | null;
  stage?: string | null;
}) => deal.archived_at == null && !isTerminalDealStage(deal.stage);

export { isTerminalDealStage, UNARCHIVED_DEALS_LIST_PARAMS };
