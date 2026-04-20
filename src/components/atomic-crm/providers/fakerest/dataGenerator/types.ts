import type {
  Company,
  Contact,
  ContactNote,
  Deal,
  DealNote,
  IntakeLead,
  OutreachStep,
  Sale,
  Tag,
  Task,
} from "../../../types";
import type { ConfigurationContextValue } from "../../../root/ConfigurationContext";

export interface ResourceRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: "sales" | "onboarding" | "templates" | "internal";
  storage_path: string | null;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  ext: string;
  tags: string[];
  starred: boolean;
  preview: string;
  created_at: string;
  updated_at: string;
}

export interface Db {
  companies: Company[];
  contacts: Contact[];
  contact_notes: ContactNote[];
  contact_tags: Array<{ id: string; contact_id: number; tag_id: number }>;
  deals: Deal[];
  deal_contacts: Array<{ id: string; deal_id: number; contact_id: number }>;
  deal_notes: DealNote[];
  intake_leads: IntakeLead[];
  outreach_steps: OutreachStep[];
  lead_sources: Array<{ id: string; name: string }>;
  resources: ResourceRow[];
  sales: Sale[];
  tags: Tag[];
  tasks: Task[];
  trade_types: Array<{ id: string; name: string }>;
  configuration: Array<{ id: number; config: ConfigurationContextValue }>;
}
