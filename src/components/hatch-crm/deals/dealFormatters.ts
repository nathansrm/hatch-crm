import {
  defaultDealStages,
  defaultDealCategories,
} from "../root/defaultConfiguration";

const stageLabels: Record<string, string> = Object.fromEntries(
  defaultDealStages.map((s) => [s.value, s.label]),
);
const categoryLabels: Record<string, string> = Object.fromEntries(
  defaultDealCategories.map((c) => [c.value, c.label]),
);

function slugToTitle(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatStage(slug: string): string {
  return stageLabels[slug] ?? slugToTitle(slug);
}

export function formatCategory(slug: string): string {
  return categoryLabels[slug] ?? slugToTitle(slug);
}
