import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { buildContact, createCrmDb, StoryWrapper } from "@/test/StoryWrapper";

const buildCompany = (overrides: Record<string, unknown> = {}) => ({
  address: "",
  city: "",
  country: "US",
  created_at: "2026-01-01T09:00:00.000Z",
  description: "",
  id: 1,
  linkedin_url: "",
  logo: { rawFile: new File([], "logo.png"), src: "", title: "logo.png" },
  name: "Acme Roofing",
  nb_contacts: 1,
  nb_deals: 3,
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

const createWidgetData = () =>
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
        id: 2,
        name: "Started Project",
        project_progress_pct: 50,
        project_started_at: "2026-03-15T09:00:00.000Z",
        project_status: "on_track",
        projected_hours: 20,
      }),
      buildDeal({
        id: 3,
        name: "Discovery Call",
        stage: "proposal",
      }),
    ] as any,
    intake_leads: [],
    lead_sources: [],
    outreach_steps: [],
    tasks: [],
    trade_types: [],
  } as any);

describe("Delivery dashboard widgets", () => {
  it("exports calcUtilization for delivery capacity calculations", async () => {
    const { calcUtilization } = await import("./deliveryMath");

    expect(
      calcUtilization(
        [{ projected_hours: 20 }, { projected_hours: 60 }] as any,
        40,
      ),
    ).toBe(200);
  });

  it("shows only won deals without a project status in the handoff queue", async () => {
    const { HandoffQueue } = await import("./HandoffQueue");

    const screen = await render(
      <StoryWrapper data={createWidgetData()}>
        <HandoffQueue />
      </StoryWrapper>,
    );

    await expect
      .element(screen.getByText("Awaiting Kickoff"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Started Project"))
      .not.toBeInTheDocument();
    await expect
      .element(screen.getByText("Discovery Call"))
      .not.toBeInTheDocument();
  });
});
