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

// Keep these params identical across the dashboard KPI cards so react-admin can
// dedupe the shared "deals" fetch instead of issuing parallel equivalent queries.
export const UNARCHIVED_DEALS_LIST_PARAMS = {
  pagination: { page: 1, perPage: 10000 },
  filter: { "archived_at@is": null },
} as const;

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
  if (range === "30d") return "Pipeline Value Â· Created in Last 30 Days";
  if (range === "ytd") return `Pipeline Value Â· Created YTD ${now.getFullYear()}`;
  const q = Math.floor(now.getMonth() / 3) + 1;
  return `Pipeline Value Â· Created in Q${q} ${now.getFullYear()}`;
};

export const AVATAR_COLORS = ["#4DC8E8", "#A78BFA", "#F5B84A", "#34D399", "#EF5A6F"];
