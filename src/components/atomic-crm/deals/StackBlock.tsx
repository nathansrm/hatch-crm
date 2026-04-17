import { Badge } from "@/components/ui/badge";

import type { Deal } from "../types";
import { stackInfo } from "./stackInfo";

const difficultyColor = {
  easy: "text-emerald-600",
  moderate: "text-amber-600",
  hard: "text-red-600",
} as const;

export const StackBlock = ({ record }: { record: Deal }) => {
  const stackSlugs = Array.isArray(record.software_stack)
    ? record.software_stack.filter(Boolean)
    : [];

  return (
    <section className="rounded-lg border p-4 space-y-3">
      <h3 className="text-sm font-semibold">Current Stack</h3>
      {stackSlugs.length > 0 ? (
        <div className="space-y-2">
          {stackSlugs.map((slug) => {
            const tool = stackInfo[slug];
            const difficulty = tool?.migration.difficulty ?? "moderate";

            return (
              <div
                key={slug}
                className="flex flex-col gap-2 rounded-md border p-2 sm:flex-row sm:items-center"
              >
                <span className="text-sm font-medium">{tool?.name ?? slug}</span>
                <Badge variant="outline" className="w-fit text-xs">
                  {tool?.category ?? "Other"}
                </Badge>
                <span
                  className={`text-xs sm:ml-auto ${difficultyColor[difficulty]}`}
                >
                  {tool?.migration.note ?? "Migration details unknown"}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No software stack recorded.
        </p>
      )}
    </section>
  );
};
