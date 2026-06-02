import type { Db } from "./types";

const tags = [
  { id: 0, name: "football-fan", color: "#4dc8e8" },
  { id: 1, name: "holiday-card", color: "#a78bfa" },
  { id: 2, name: "influencer", color: "#5eead4" },
  { id: 3, name: "manager", color: "#f5b84a" },
  { id: 4, name: "musician", color: "#ef5a6f" },
  { id: 5, name: "vip", color: "#34d399" },
];

export const generateTags = (_: Db) => {
  return [...tags];
};
