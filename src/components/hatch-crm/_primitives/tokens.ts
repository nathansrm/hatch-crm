/**
 * Hatch design tokens — the canonical color/elevation/typography values used
 * by every primitive. Exported as both a JS object and class string helpers
 * so callers can opt into either style/className authoring.
 */
export const HATCH = {
  // Surfaces
  surfaceBg: "linear-gradient(180deg, #0D1424 0%, #080C1A 100%)",
  surface: "#0D1424",
  surfaceDeep: "#080C1A",
  border: "rgba(255,255,255,0.07)",
  borderStrong: "rgba(255,255,255,0.14)",
  fieldBg: "rgba(255,255,255,0.03)",
  fieldBorder: "rgba(255,255,255,0.09)",
  hover: "rgba(255,255,255,0.04)",
  // Type
  textHi: "#ECEEF5",
  textMd: "#B8C0D6",
  textLo: "#9AA3BE",
  textMuted: "#5C6784",
  // Accents
  cyan: "#4DC8E8",
  cyanSoft: "#7DDCF0",
  cyanGlow: "rgba(77,200,232,0.25)",
  cyanTint: "rgba(77,200,232,0.14)",
  cyanInk: "#06111F",
  danger: "#EF5A6F",
  dangerBg: "rgba(239,90,111,0.08)",
  dangerBorder: "rgba(239,90,111,0.28)",
  // Elevation
  shadowCard: "0 8px 16px rgba(0,0,0,0.25)",
  shadowSheet: "0 20px 40px rgba(0,0,0,0.3)",
  shadowDialog: "0 20px 40px rgba(0,0,0,0.45)",
  // Eyebrow type
  eyebrow:
    "text-[10px] font-bold uppercase tracking-[0.22em] text-[#5C6784]",
} as const;

export const HATCH_CLASS = {
  surface:
    "rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#0D1424] text-[#ECEEF5]",
  field:
    "w-full rounded-lg border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.03)] text-[#ECEEF5] outline-none placeholder:text-[#5C6784] focus:border-[#4DC8E8]",
  eyebrow:
    "text-[10px] font-bold uppercase tracking-[0.22em] text-[#5C6784]",
  eyebrowAccent:
    "text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#4DC8E8]",
  fieldLabel:
    "mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#9AA3BE]",
} as const;
