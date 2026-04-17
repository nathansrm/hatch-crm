import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { buildContact, createCrmDb, StoryWrapper } from "@/test/StoryWrapper";

vi.mock("./DeliveryDashboard", () => ({
  DeliveryDashboard: () => <div>DeliveryDashboard component</div>,
}));

import { Dashboard } from "./Dashboard";

const buildCompany = (overrides: Record<string, unknown> = {}) => ({
  address: "",
  city: "",
  country: "US",
  created_at: "2026-01-01T09:00:00.000Z",
  description: "",
  email: "",
  id: 1,
  linkedin_url: "",
  logo: { rawFile: new File([], "logo.png"), src: "", title: "logo.png" },
  name: "Acme Roofing",
  nb_contacts: 1,
  nb_deals: 2,
  phone_number: "",
  revenue: "",
  sales_id: 0,
  sector: "Roofing",
  size: 10,
  state_abbr: "CA",
  tax_identifier: "",
  website: "",
  zipcode: "",
  ...overrides,
});

const buildDeal = (overrides: Record<string, unknown> = {}) => ({
  amount: 15000,
  category: "implementation",
  company_id: 1,
  contact_ids: [1],
  created_at: "2026-03-01T09:00:00.000Z",
  description: "Seeded deal",
  expected_closing_date: "2026-04-20",
  id: 1,
  index: 0,
  name: "Awaiting Kickoff",
  sales_id: 0,
  stage: "won",
  updated_at: "2026-03-02T09:00:00.000Z",
  ...overrides,
});

const createDashboardData = () =>
  createCrmDb({
    companies: [buildCompany()],
    contact_notes: [
      {
        contact_id: 1,
        date: "2026-03-10T09:00:00.000Z",
        id: 1,
        sales_id: 0,
        status: "open",
        text: "Seed note",
      },
    ],
    contact_tags: [],
    contacts: [
      buildContact({
        company_id: 1,
        company_name: "Acme Roofing",
        id: 1,
        sales_id: 0,
      }),
    ],
    deal_contacts: [],
    deals: [
      buildDeal(),
      buildDeal({
        amount: 22000,
        id: 2,
        name: "Active Delivery",
        project_progress_pct: 45,
        project_started_at: "2026-03-12T09:00:00.000Z",
        project_status: "on_track",
        projected_hours: 24,
      }),
    ] as any,
    intake_leads: [],
    lead_sources: [],
    outreach_steps: [],
    tasks: [],
    trade_types: [],
  } as any);

describe("Dashboard", () => {
  it("renders the delivery dashboard when ?view=delivery is set", async () => {
    const screen = await render(
      <StoryWrapper
        data={createDashboardData()}
        initialEntries={["/?view=delivery"]}
      >
        <Dashboard />
      </StoryWrapper>,
    );

    await expect
      .element(screen.getByText("DeliveryDashboard component"))
      .toBeInTheDocument();
  });
});
