export const stageColorMap: Record<
  string,
  { border: string; bg: string; text: string }
> = {
  discovery: { border: "#4DC8E8", bg: "rgba(77,200,232,0.08)", text: "#4DC8E8" },
  "solutions-mapping": {
    border: "#A78BFA",
    bg: "rgba(167,139,250,0.08)",
    text: "#A78BFA",
  },
  "proposal-under-review": {
    border: "#F5B84A",
    bg: "rgba(245,184,74,0.08)",
    text: "#F5B84A",
  },
  won: { border: "#34D399", bg: "rgba(52,211,153,0.08)", text: "#34D399" },
  lost: { border: "#EF5A6F", bg: "rgba(239,90,111,0.08)", text: "#EF5A6F" },
};
