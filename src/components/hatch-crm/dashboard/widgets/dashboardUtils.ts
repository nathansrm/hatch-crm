export const getTodayDateKey = () => {
  const date = new Date();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
};

export const getDateKey = (value?: string | null) => value?.slice(0, 10) ?? null;

export const getValidDate = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

type DealStageLike = {
  label: string;
  value: string;
};

const TERMINAL_DEAL_STAGE_VALUES = new Set(["won", "lost"]);
const PIPELINE_STAGE_COLORS = ["#4DC8E8", "#A78BFA", "#5EEAD4", "#F5B84A", "#EF5A6F"];

// TODO: Replace the large per-page fetches with server-side dashboard aggregates.
export const DASHBOARD_COLLECTION_PAGINATION = {
  page: 1,
  perPage: 10000,
} as const;

// Keep these params identical across the dashboard KPI cards so react-admin can
// dedupe the shared "deals" fetch instead of issuing parallel equivalent queries.
export const UNARCHIVED_DEALS_LIST_PARAMS = {
  pagination: DASHBOARD_COLLECTION_PAGINATION,
  filter: { "archived_at@is": null },
} as const;

export const isTerminalDealStage = (stageValue?: string | null) =>
  stageValue != null && TERMINAL_DEAL_STAGE_VALUES.has(stageValue);

export const getNonTerminalDealStages = <T extends DealStageLike>(dealStages: T[]) =>
  dealStages.filter((stage) => !isTerminalDealStage(stage.value));

export const getNonTerminalDealStageValues = (dealStages: DealStageLike[]) =>
  getNonTerminalDealStages(dealStages).map((stage) => stage.value);

export const getStagePalette = (dealStages: DealStageLike[]) =>
  getNonTerminalDealStages(dealStages).map((stage, index) => ({
    ...stage,
    color: PIPELINE_STAGE_COLORS[index % PIPELINE_STAGE_COLORS.length],
  }));

export const getWatchStageValue = (dealStages: DealStageLike[]) => {
  const stagePalette = getNonTerminalDealStages(dealStages);

  return (
    stagePalette.find((stage) => stage.value === "proposal-sent")?.value ??
    stagePalette.at(-1)?.value ??
    null
  );
};

export const formatCompactCurrency = (value: number, currency: string) => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue < 1000) {
    return value.toLocaleString(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
  }

  const divisor = absValue >= 1_000_000 ? 1_000_000 : 1000;
  const suffix = divisor === 1_000_000 ? "M" : "K";
  const compactValue = absValue / divisor;
  const displayValue = compactValue.toLocaleString(undefined, {
    minimumFractionDigits: compactValue < 10 ? 1 : 0,
    maximumFractionDigits: 1,
  });
  const currencySymbol =
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? `${currency} `;

  return `${sign}${currencySymbol}${displayValue}${suffix}`;
};

export type HeroRange = "30d" | "qtd" | "ytd";

export const getRangeWindow = (range: HeroRange) => {
  const now = new Date();
  if (range === "30d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    const priorStart = new Date(now);
    priorStart.setDate(priorStart.getDate() - 60);
    return { start, end: now, priorStart, priorEnd: new Date(start) };
  }
  if (range === "qtd") {
    const qStartMonth = Math.floor(now.getMonth() / 3) * 3;
    const start = new Date(now.getFullYear(), qStartMonth, 1);
    const priorStart = new Date(now.getFullYear(), qStartMonth - 3, 1);
    return { start, end: now, priorStart, priorEnd: new Date(start) };
  }
  const start = new Date(now.getFullYear(), 0, 1);
  return {
    start,
    end: now,
    priorStart: new Date(now.getFullYear() - 1, 0, 1),
    priorEnd: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
  };
};

export const getHeroEyebrow = (range: HeroRange) => {
  const now = new Date();
  if (range === "30d") return "Pipeline Value · Created in Last 30 Days";
  if (range === "ytd") return `Pipeline Value · Created YTD ${now.getFullYear()}`;
  const q = Math.floor(now.getMonth() / 3) + 1;
  return `Pipeline Value · Created in Q${q} ${now.getFullYear()}`;
};

export const AVATAR_COLORS = ["#4DC8E8", "#A78BFA", "#F5B84A", "#34D399", "#EF5A6F"];
