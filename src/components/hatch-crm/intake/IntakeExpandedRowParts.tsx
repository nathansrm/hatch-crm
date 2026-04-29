import { HATCH } from "../_primitives";

export const SnapshotItem = ({
  label,
  value,
  tone = "normal",
}: {
  label: string;
  value: string;
  tone?: "normal" | "muted" | "ready" | "warning";
}) => {
  const color =
    tone === "ready"
      ? "#34D399"
      : tone === "warning"
        ? "#F7C948"
        : tone === "muted"
          ? HATCH.textMuted
          : HATCH.textMd;

  return (
    <div>
      <div
        style={{
          color: HATCH.textMuted,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 3,
          color,
          fontSize: 12.5,
          fontWeight: 650,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </div>
    </div>
  );
};

export const DraftStatusPill = ({ label }: { label: string }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      whiteSpace: "nowrap",
      borderRadius: 999,
      border: "1px solid rgba(77,200,232,0.28)",
      background: "rgba(77,200,232,0.1)",
      color: HATCH.cyan,
      padding: "5px 10px",
      fontSize: 11.5,
      fontWeight: 750,
    }}
  >
    {label}
  </span>
);

export const SnapshotTagList = ({ tags }: { tags: string[] }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 14,
    }}
  >
    {tags.map((tag) => (
      <span
        key={tag}
        style={{
          border: `1px solid ${HATCH.borderStrong}`,
          borderRadius: 6,
          color: HATCH.textMd,
          background: "rgba(255,255,255,0.03)",
          padding: "5px 8px",
          fontSize: 11.5,
          fontWeight: 650,
        }}
      >
        {tag}
      </span>
    ))}
  </div>
);
