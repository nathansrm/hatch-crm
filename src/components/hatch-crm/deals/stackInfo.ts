export type StackTool = {
  slug: string;
  name: string;
  category:
    | "CRM"
    | "Scheduling"
    | "Estimating"
    | "Comms"
    | "Accounting"
    | "Other";
  migration: {
    difficulty: "easy" | "moderate" | "hard";
    note: string;
  };
};

export const stackInfo: Record<string, StackTool> = {
  jobber: {
    slug: "jobber",
    name: "Jobber",
    category: "Scheduling",
    migration: {
      difficulty: "moderate",
      note: "Most customer and job data can be exported, but workflows need remapping.",
    },
  },
  servicetitan: {
    slug: "servicetitan",
    name: "ServiceTitan",
    category: "CRM",
    migration: {
      difficulty: "hard",
      note: "Enterprise-style setup usually needs careful field mapping and process migration.",
    },
  },
  buildertrend: {
    slug: "buildertrend",
    name: "Buildertrend",
    category: "Scheduling",
    migration: {
      difficulty: "moderate",
      note: "Project data is portable, but active job workflows take planning to move cleanly.",
    },
  },
  jobtread: {
    slug: "jobtread",
    name: "JobTread",
    category: "Estimating",
    migration: {
      difficulty: "moderate",
      note: "Estimate templates migrate fairly well, but automation logic often needs cleanup.",
    },
  },
  quickbooks: {
    slug: "quickbooks",
    name: "QuickBooks",
    category: "Accounting",
    migration: {
      difficulty: "easy",
      note: "Financial exports are standard, so accounting history is usually straightforward to carry over.",
    },
  },
  "google-sheets": {
    slug: "google-sheets",
    name: "Google Sheets",
    category: "Other",
    migration: {
      difficulty: "easy",
      note: "Spreadsheet data is easy to import, but the process logic usually lives in tribal knowledge.",
    },
  },
  hubspot: {
    slug: "hubspot",
    name: "HubSpot",
    category: "CRM",
    migration: {
      difficulty: "moderate",
      note: "Contacts and pipeline data move cleanly, but custom properties need a mapping pass.",
    },
  },
  monday: {
    slug: "monday",
    name: "monday.com",
    category: "Other",
    migration: {
      difficulty: "moderate",
      note: "Board exports help, but operational workflows often need manual reconstruction.",
    },
  },
  "housecall-pro": {
    slug: "housecall-pro",
    name: "Housecall Pro",
    category: "Scheduling",
    migration: {
      difficulty: "moderate",
      note: "Core customer and job records are movable, but dispatch habits still need retraining.",
    },
  },
  excel: {
    slug: "excel",
    name: "Excel",
    category: "Other",
    migration: {
      difficulty: "easy",
      note: "Raw data is easy to ingest, but formulas and side spreadsheets usually hide process debt.",
    },
  },
  "no-software": {
    slug: "no-software",
    name: "No Software",
    category: "Other",
    migration: {
      difficulty: "easy",
      note: "There is little structured data to migrate, but process adoption work is usually highest.",
    },
  },
};
