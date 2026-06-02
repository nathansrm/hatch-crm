/**
 * Tag colors for the Obsidian dark chrome theme.
 *
 * The previous palette was Atomic CRM's light pastels (#eddcd2, #fff1e6, …),
 * which only read correctly against a white background and forced hardcoded
 * `text-black` on every tag chip. These are the canonical accent tints, which
 * sit well on dark surfaces.
 */
export const colors = [
  "#4dc8e8", // cyan
  "#a78bfa", // violet
  "#5eead4", // teal
  "#f5b84a", // amber
  "#ef5a6f", // rose
  "#34d399", // green
  "#7ddcf0", // sky
  "#f87191", // pink
  "#60a5fa", // blue
  "#b8c0d6", // slate
];

/**
 * Returns a readable text color (`#0b0f1a` dark or `#f5f7fb` light) for a given
 * solid background, based on relative luminance. This lets a single tag chip
 * render correctly whether its stored color is a bright accent tint or one of
 * the legacy pastels still in the database.
 */
export function getContrastText(background?: string | null): string {
  const fallback = "#f5f7fb";
  if (!background) return fallback;

  const hex = background.trim().replace("#", "");
  const normalized =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;

  if (normalized.length !== 6 || /[^0-9a-fA-F]/.test(normalized)) {
    return fallback;
  }

  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  // Perceived luminance (sRGB weights).
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  return luminance > 0.6 ? "#0b0f1a" : "#f5f7fb";
}
