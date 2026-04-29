import { ActivityLog } from "../activity/ActivityLog";

export function DashboardActivityLog() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        padding: "20px 22px",
        background:
          "linear-gradient(180deg, var(--ink-3) 0%, var(--ink-2-deep) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        color: "var(--fg-mid)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          paddingBottom: 12,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--fg-3)",
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            Live
          </div>
          <h3
            className="font-heading"
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "var(--fg-1)",
            }}
          >
            Team activity
          </h3>
        </div>
      </div>
      <ActivityLog pageSize={8} />
    </section>
  );
}
