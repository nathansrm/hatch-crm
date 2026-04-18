import { useState } from "react";
import { FileText, Copy, Search, Plus, Send, Edit, X, Star } from "lucide-react";

type ResourceCategory = "all" | "sales" | "onboarding" | "templates" | "internal";

type Resource = {
  id: number;
  category: Exclude<ResourceCategory, "all">;
  title: string;
  desc: string;
  type: "document" | "template";
  ext: string;
  size: string;
  updated: string;
  tags: string[];
  starred: boolean;
  preview: string;
};

const RESOURCES: Resource[] = [
  {
    id: 1, category: "sales", title: "Discovery Call Script",
    desc: "Opening questions, pain-point discovery, and objection handling for initial sales calls.",
    type: "document", ext: "md", size: "8 KB", updated: "2026-04-10T09:00:00Z",
    tags: ["sales", "scripts"], starred: true,
    preview: "## Discovery Call Script\n\n### Opening\n\"Thanks for taking the time, [Name]. Before I jump in, I want to make sure this is actually valuable for you — can you tell me a bit about what's not working in your ops right now?\"\n\n### Pain Discovery\n- How many hours per week does your team spend on scheduling/dispatch?\n- What happens when a lead comes in after hours?\n- What does your quoting process look like today?",
  },
  {
    id: 2, category: "sales", title: "Proposal Template — Standard",
    desc: "Hatch Theory standard proposal for workflow automation engagements.",
    type: "document", ext: "docx", size: "42 KB", updated: "2026-04-12T14:00:00Z",
    tags: ["sales", "proposals"], starred: true,
    preview: "Standard proposal structure:\n1. Executive Summary\n2. Current State & Pain Points\n3. Proposed Solution\n4. Scope of Work\n5. Investment\n6. Timeline\n7. Terms",
  },
  {
    id: 3, category: "sales", title: "Pricing Tiers — 2026",
    desc: "Current pricing tiers for all Hatch Theory service packages.",
    type: "document", ext: "md", size: "5 KB", updated: "2026-04-01T10:00:00Z",
    tags: ["sales", "pricing"], starred: false,
    preview: "## Starter — $4,500\nCRM setup + basic lead intake automation\n\n## Growth — $8,500\nFull CRM + dispatch automation + reporting\n\n## Pro — $15,000+\nFull digital transformation, custom workflows, ongoing support",
  },
  {
    id: 4, category: "onboarding", title: "Client Onboarding Checklist",
    desc: "Step-by-step onboarding process for new clients post-close.",
    type: "document", ext: "md", size: "12 KB", updated: "2026-04-14T11:00:00Z",
    tags: ["onboarding", "process"], starred: true,
    preview: "## Week 1: Kickoff\n- [ ] Kickoff call scheduled\n- [ ] Credentials collected\n- [ ] Existing tools documented\n- [ ] SOW reviewed and signed\n\n## Week 2–3: Build\n- [ ] Workflows mapped\n- [ ] CRM configured\n- [ ] Test data loaded\n\n## Week 4: Training\n- [ ] Team training session\n- [ ] Recorded walkthrough delivered\n- [ ] Go-live sign-off",
  },
  {
    id: 5, category: "onboarding", title: "Welcome Package — Client Facing",
    desc: "Branded welcome email + what to expect during onboarding.",
    type: "document", ext: "md", size: "6 KB", updated: "2026-04-08T10:00:00Z",
    tags: ["onboarding", "email"], starred: false,
    preview: "Subject: Welcome to Hatch Theory — here's what happens next\n\nHey [Name],\n\nWelcome aboard! Here's what the next 4 weeks look like...",
  },
  {
    id: 6, category: "onboarding", title: "Tech Stack Intake Form",
    desc: "Questions to fill in before kickoff — tools, logins, current processes.",
    type: "document", ext: "md", size: "4 KB", updated: "2026-04-05T09:00:00Z",
    tags: ["onboarding", "intake"], starred: false,
    preview: "1. What CRM/job management tool do you currently use?\n2. How do you handle inbound leads today?\n3. What scheduling software do you use?\n4. Who on your team will be the primary contact?",
  },
  {
    id: 7, category: "templates", title: "Follow-Up Email — Post Demo",
    desc: "Email to send 24h after a demo call.",
    type: "template", ext: "md", size: "3 KB", updated: "2026-04-11T14:00:00Z",
    tags: ["email", "follow-up"], starred: true,
    preview: "Subject: Great talking today, [Name]\n\nHey [Name],\n\nReally enjoyed our conversation — sounds like there's a strong fit for what you're trying to build at [Company].\n\nAs promised, attaching the proposal. A few things I'd highlight...",
  },
  {
    id: 8, category: "templates", title: "Proposal Cover Email",
    desc: "Email template to send alongside the proposal PDF.",
    type: "template", ext: "md", size: "2 KB", updated: "2026-04-09T10:00:00Z",
    tags: ["email", "proposals"], starred: false,
    preview: "Subject: Hatch Theory Proposal — [Company Name]\n\nHey [Name],\n\nHere's the proposal we put together based on our conversation...",
  },
  {
    id: 9, category: "internal", title: "Audit Framework — AI Audit",
    desc: "Internal framework for conducting AI readiness audits with trades clients.",
    type: "document", ext: "md", size: "18 KB", updated: "2026-04-15T16:00:00Z",
    tags: ["internal", "audit"], starred: false,
    preview: "## Phase 1: Tech Stack Inventory\n- Current tools\n- Integration points\n- Manual processes\n\n## Phase 2: Pain Point Mapping\n- Scheduling gaps\n- Lead handling\n- Communication\n\n## Phase 3: ROI Estimate\n- Hours saved/week\n- Revenue captured vs lost",
  },
  {
    id: 10, category: "internal", title: "SOW Template — Workflow Automation",
    desc: "Statement of work template for workflow automation projects.",
    type: "document", ext: "docx", size: "28 KB", updated: "2026-04-13T11:00:00Z",
    tags: ["internal", "legal"], starred: false,
    preview: "This Statement of Work is entered into between Hatch Theory Solutions Inc. and [Client Name]...",
  },
];

const CATEGORIES: { key: ResourceCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sales", label: "Sales" },
  { key: "onboarding", label: "Onboarding" },
  { key: "templates", label: "Templates" },
  { key: "internal", label: "Internal" },
];

const EXT_COLORS: Record<string, string> = {
  md: "#4DC8E8",
  docx: "#A78BFA",
  pdf: "#F5B84A",
  xlsx: "#34D399",
};

const fmtRel = (iso: string) => {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
};

export const ResourcesPage = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ResourceCategory>("all");
  const [selected, setSelected] = useState<Resource | null>(null);

  const filtered = RESOURCES.filter((r) => {
    const matchCat = category === "all" || r.category === category;
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.tags.some((t) => t.includes(q));
    return matchCat && matchSearch;
  });

  const starred = filtered.filter((r) => r.starred);
  const rest = filtered.filter((r) => !r.starred);

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, background: "#060A16" }}>
      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {/* Page header */}
        <div style={{ padding: "24px 28px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "#4DC8E8", fontWeight: 700 }}>Library</span>
            <span style={{ height: 1, width: 24, background: "rgba(77,200,232,0.4)" }} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ margin: 0, fontFamily: '"Manrope Variable", ui-sans-serif', fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "#ECEEF5" }}>Resources</h1>
              <p style={{ margin: "4px 0 0", color: "#6B7494", fontSize: 13 }}>Sales scripts, onboarding packages, templates, and client materials</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px 12px", width: 220 }}>
                <Search size={14} color="#4A5270" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search resources…"
                  style={{ background: "transparent", border: "none", outline: "none", color: "#ECEEF5", fontSize: 13, width: "100%" }}
                />
              </div>
              <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#4DC8E8", color: "#061022", borderRadius: 7, fontWeight: 700, fontSize: 12.5, border: "none", cursor: "pointer" }}>
                <Plus size={14} strokeWidth={2.5} /> Upload
              </button>
            </div>
          </div>

          {/* Category tabs */}
          <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                style={{
                  padding: "6px 14px", borderRadius: 7, fontSize: 12.5, fontWeight: 600,
                  color: category === c.key ? "#ECEEF5" : "#6B7494",
                  background: category === c.key ? "rgba(255,255,255,0.06)" : "transparent",
                  border: category === c.key ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                  cursor: "pointer",
                }}
              >
                {c.label}{" "}
                <span style={{ fontFamily: '"JetBrains Mono", ui-monospace', fontSize: 10.5, color: category === c.key ? "#4DC8E8" : "#4A5270" }}>
                  {RESOURCES.filter((r) => c.key === "all" || r.category === c.key).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 28px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
          {starred.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Star size={12} color="#F5B84A" fill="#F5B84A" />
                <span style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4A5270", fontWeight: 700 }}>Pinned</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {starred.map((r) => <ResourceCard key={r.id} r={r} selected={selected} setSelected={setSelected} />)}
              </div>
            </div>
          )}

          {rest.length > 0 && (
            <div>
              {starred.length > 0 && (
                <div style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4A5270", fontWeight: 700, marginBottom: 12 }}>All resources</div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {rest.map((r) => <ResourceCard key={r.id} r={r} selected={selected} setSelected={setSelected} />)}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div style={{ padding: "60px 0", textAlign: "center", color: "#4A5270", fontSize: 14 }}>No resources match your search.</div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{ width: 380, flexShrink: 0, background: "#0A0F1A", borderLeft: "1px solid rgba(255,255,255,0.06)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ flex: 1, marginRight: 12 }}>
              <div style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4DC8E8", fontWeight: 700, marginBottom: 6 }}>{selected.category}</div>
              <h2 style={{ margin: 0, fontFamily: '"Manrope Variable", ui-sans-serif', fontSize: 17, fontWeight: 700, color: "#ECEEF5", letterSpacing: "-0.01em", lineHeight: 1.3 }}>{selected.title}</h2>
              <div style={{ fontSize: 12, color: "#6B7494", marginTop: 4 }}>{selected.desc}</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ color: "#6B7494", padding: 4, background: "transparent", border: "none", cursor: "pointer", flexShrink: 0 }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 20, flexShrink: 0 }}>
            {[["Type", selected.ext.toUpperCase()], ["Size", selected.size], ["Updated", fmtRel(selected.updated)]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#4A5270", fontWeight: 700, marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 12.5, color: "#ECEEF5", fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: "14px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8, flexShrink: 0 }}>
            <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 8, background: "#4DC8E8", color: "#061022", fontWeight: 700, fontSize: 12.5, border: "none", cursor: "pointer" }}>
              <Send size={13} strokeWidth={2.5} /> Send to client
            </button>
            <button style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", color: "#6B7494", cursor: "pointer" }}>
              <Copy size={14} />
            </button>
            <button style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", color: "#6B7494", cursor: "pointer" }}>
              <Edit size={14} />
            </button>
          </div>

          <div style={{ padding: "16px 22px", flex: 1, overflowY: "auto" }}>
            <div style={{ fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#4A5270", fontWeight: 700, marginBottom: 12 }}>Preview</div>
            <pre style={{ margin: 0, fontFamily: '"JetBrains Mono", ui-monospace', fontSize: 11.5, color: "#6B7494", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: "14px 16px" }}>
              {selected.preview}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

const ResourceCard = ({
  r,
  selected,
  setSelected,
}: {
  r: Resource;
  selected: Resource | null;
  setSelected: (r: Resource) => void;
}) => {
  const color = EXT_COLORS[r.ext] ?? "#9AA3BE";
  const isActive = selected?.id === r.id;

  return (
    <div
      onClick={() => setSelected(r)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px",
        borderRadius: 10,
        background: isActive ? "#131B2E" : "#0D1424",
        border: isActive ? "1px solid rgba(77,200,232,0.3)" : "1px solid rgba(255,255,255,0.05)",
        cursor: "pointer",
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 9, flexShrink: 0,
        background: `${color}12`, border: `1px solid ${color}33`,
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2,
      }}>
        {r.type === "template" ? <Copy size={16} color={color} strokeWidth={1.8} /> : <FileText size={16} color={color} strokeWidth={1.8} />}
        <span style={{ fontSize: 8.5, fontWeight: 700, color, letterSpacing: "0.06em", textTransform: "uppercase" }}>.{r.ext}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#ECEEF5", fontFamily: '"Manrope Variable", ui-sans-serif' }}>{r.title}</span>
          {r.starred && <Star size={12} color="#F5B84A" fill="#F5B84A" />}
        </div>
        <div style={{ fontSize: 12, color: "#6B7494", marginBottom: 6, lineHeight: 1.4 }}>{r.desc}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {r.tags.map((t) => (
            <span key={t} style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#4A5270", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)", padding: "2px 7px", borderRadius: 3 }}>{t}</span>
          ))}
          <span style={{ fontSize: 11, color: "#4A5270", marginLeft: "auto", fontFamily: '"JetBrains Mono", ui-monospace' }}>{r.size} · {fmtRel(r.updated)}</span>
        </div>
      </div>
    </div>
  );
};

ResourcesPage.path = "/resources";
