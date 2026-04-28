import { add } from "date-fns";
import { datatype, lorem, random } from "faker/locale/en_US";

import {
  defaultDealCategories,
  defaultDealStages,
} from "../../../root/defaultConfiguration";
import { stackInfo } from "../../../deals/stackInfo";
import type { Deal } from "../../../types";
import type { Db } from "./types";
import { randomDate } from "./utils";

const predictiveBottlenecks = [
  "Lead response speed",
  "Estimating turnaround",
  "Job scheduling",
  "Invoicing delays",
  "Manual data entry",
];

const predictiveStackSlugs = Object.keys(stackInfo);

export const generateDeals = (db: Db): Deal[] => {
  const deals = Array.from(Array(50).keys()).map((id): Deal => {
    const company = random.arrayElement(db.companies);
    company.nb_deals = (company.nb_deals ?? 0) + 1;
    const contacts = random.arrayElements(
      db.contacts.filter((contact) => contact.company_id === company.id),
      datatype.number({ min: 1, max: 3 }),
    );
    const lowercaseName = lorem.words();
    const created_at = randomDate(new Date(company.created_at)).toISOString();

    const expected_closing_date = randomDate(
      new Date(created_at),
      add(new Date(created_at), { months: 6 }),
    )
      .toISOString()
      .split("T")[0];
    const isEnriched = Math.random() < 0.6;

    return {
      id,
      name: lowercaseName[0].toUpperCase() + lowercaseName.slice(1),
      company_id: company.id,
      contact_ids: contacts.map((contact) => contact.id),
      category: random.arrayElement(defaultDealCategories).value,
      stage: random.arrayElement(defaultDealStages).value,
      ...(isEnriched
        ? {
            primary_bottleneck: random.arrayElement(predictiveBottlenecks),
            software_stack: random.arrayElements(
              predictiveStackSlugs,
              datatype.number({ min: 1, max: 3 }),
            ),
            dm_present: Math.random() < 0.5,
            hours_wasted_per_week: datatype.number({ min: 2, max: 20 }),
            response_time_hours: datatype.number({ min: 1, max: 72 }),
          }
        : {}),
      description: lorem.paragraphs(datatype.number({ min: 1, max: 4 })),
      amount: datatype.number(1000) * 100,
      created_at,
      updated_at: randomDate(new Date(created_at)).toISOString(),
      expected_closing_date,
      sales_id: company.sales_id!,
      index: 0,
    };
  });

  random.arrayElements(deals, 4).forEach((deal) => {
    deal.stage = "won";
    deal.project_status = random.arrayElement(["on_track", "at_risk"]);
    deal.project_progress_pct = datatype.number({ min: 30, max: 80 });
    deal.projected_hours = datatype.number({ min: 20, max: 80 });
    deal.project_started_at = randomDate(
      add(new Date(), { weeks: -6 }),
      add(new Date(), { weeks: -2 }),
    ).toISOString();
  });

  // compute index based on stage
  defaultDealStages.forEach((stage) => {
    deals
      .filter((deal) => deal.stage === stage.value)
      .forEach((deal, index) => {
        deal.index = index;
      });
  });
  return deals;
};
