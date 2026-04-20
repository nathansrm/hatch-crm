import { generateCompanies } from "./companies";
import { generateContactNotes } from "./contactNotes";
import { generateContacts } from "./contacts";
import { generateDealNotes } from "./dealNotes";
import { generateDeals } from "./deals";
import { finalize } from "./finalize";
import { generateIntakeLeads, generateLeadSources, generateTradeTypes } from "./intakeLeads";
import { generateOutreachSteps } from "./outreachSteps";
import { generateSales } from "./sales";
import { generateTags } from "./tags";
import { generateTasks } from "./tasks";
import type { Db } from "./types";

export default (): Db => {
  const db = {} as Db;
  db.sales = generateSales(db);
  db.tags = generateTags(db);
  db.trade_types = generateTradeTypes();
  db.lead_sources = generateLeadSources();
  db.companies = generateCompanies(db);
  db.contacts = generateContacts(db);
  db.contact_notes = generateContactNotes(db);
  db.deals = generateDeals(db);
  db.deal_notes = generateDealNotes(db);
  db.tasks = generateTasks(db);
  db.intake_leads = generateIntakeLeads(db);
  db.outreach_steps = generateOutreachSteps(db);
  db.contact_tags = [];
  db.deal_contacts = [];
  db.resources = [
    {
      id: "r1",
      user_id: "demo",
      title: "Hatch Onboarding Package",
      description: "Full onboarding deck for new construction clients. Covers audit process, deliverables, and next steps.",
      category: "onboarding",
      storage_path: null,
      file_name: "hatch-onboarding-v3.pdf",
      file_size: 2_400_000,
      file_type: "application/pdf",
      ext: "pdf",
      tags: ["onboarding", "client-facing"],
      starred: true,
      preview: "",
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: "r2",
      user_id: "demo",
      title: "Discovery Call Script",
      description: "15-question discovery script. Qualification gates, pain points, and budget probing.",
      category: "sales",
      storage_path: null,
      file_name: "discovery-script.docx",
      file_size: 48_000,
      file_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ext: "docx",
      tags: ["sales", "scripts"],
      starred: true,
      preview: "",
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: "r3",
      user_id: "demo",
      title: "Proposal Template - Roofing",
      description: "Scope of work template pre-filled for roofing contractors. Swap in client name and figures.",
      category: "templates",
      storage_path: null,
      file_name: "proposal-roofing.docx",
      file_size: 62_000,
      file_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ext: "docx",
      tags: ["roofing", "proposal"],
      starred: false,
      preview: "",
      created_at: new Date(Date.now() - 21 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 21 * 86400000).toISOString(),
    },
    {
      id: "r4",
      user_id: "demo",
      title: "Audit Data Request Checklist",
      description: "What to ask the client before the audit call. CRM export, spreadsheet fields, job volume.",
      category: "internal",
      storage_path: null,
      file_name: "audit-checklist.md",
      file_size: 8_200,
      file_type: "text/markdown",
      ext: "md",
      tags: ["audit", "internal"],
      starred: false,
      preview: "",
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: "r5",
      user_id: "demo",
      title: "Follow-Up Email Templates",
      description: "3-touch follow-up sequence post-discovery call. Tone: direct, value-focused, no fluff.",
      category: "sales",
      storage_path: null,
      file_name: "followup-emails.md",
      file_size: 5_600,
      file_type: "text/markdown",
      ext: "md",
      tags: ["sales", "email", "outreach"],
      starred: false,
      preview: "",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];
  db.configuration = [
    {
      id: 1,
      config: {} as Db["configuration"][number]["config"],
    },
  ];
  finalize(db);

  return db;
};
