import { ArrowRight, Flame } from "lucide-react";

type ObsInsightCardProps = {
  accent: string;
  icon: typeof Flame;
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  onClick?: () => void;
};

export const ObsInsightCard = ({
  accent,
  icon: Icon,
  eyebrow,
  title,
  sub,
  cta,
  onClick,
}: ObsInsightCardProps) => (
  <div className="obs-action-btn"
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    style={{
      padding: "16px 18px",
      borderRadius: 10,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 5.9%, transparent) 0%, color-mix(in srgb, ${accent} 1.2%, transparent) 100%)`,
      border: `1px solid color-mix(in srgb, ${accent} 16.5%, transparent)`,
      cursor: onClick ? "pointer" : "default",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          display: "grid",
          placeItems: "center",
          background: `color-mix(in srgb, ${accent} 12.2%, transparent)`,
          border: `1px solid color-mix(in srgb, ${accent} 25.1%, transparent)`,
          color: accent,
          flexShrink: 0,
        }}
      >
        <Icon size={15} strokeWidth={2.3} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: accent,
            fontWeight: 700,
            marginBottom: 2,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif",
            fontSize: 14.5,
            fontWeight: 700,
            color: "var(--color-text-primary-dark)",
            letterSpacing: "-0.01em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
      </div>
    </div>
    <div style={{ fontSize: 11.5, color: "var(--color-text-subtle-dark)" }}>
      {sub}
    </div>
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11.5,
        color: accent,
        fontWeight: 700,
        marginTop: "auto",
      }}
    >
      {cta} <ArrowRight size={12} strokeWidth={2.5} />
    </div>
  </div>
);
