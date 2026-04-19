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
      background: `linear-gradient(180deg, ${accent}0F 0%, ${accent}03 100%)`,
      border: `1px solid ${accent}2A`,
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
          background: `${accent}1F`,
          border: `1px solid ${accent}40`,
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
            color: "#ECEEF5",
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
    <div style={{ fontSize: 11.5, color: "#9AA3BE" }}>{sub}</div>
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
