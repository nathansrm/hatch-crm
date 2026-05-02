import { BANNED_WORDS } from "./banned-words.js";

export type MinimalLead = {
  business_name: string;
  city?: string;
  owner_name?: string;
  trade_type?: string;
};

export type ValidationResult = { pass: boolean; reasons: string[] };

export function validate(
  draft: { subject: string; body: string },
  lead: MinimalLead,
): ValidationResult {
  const reasons: string[] = [];
  const wordCount = draft.body.trim().split(/\s+/).filter(Boolean).length;
  const combined = `${draft.subject} ${draft.body}`;

  if (wordCount < 80 || wordCount > 110) {
    reasons.push(`word count: ${wordCount} (must be 80–110)`);
  }

  if (combined.includes("—")) {
    reasons.push("em dash not allowed");
  }

  if (combined.includes("–")) {
    reasons.push("en dash not allowed");
  }

  for (const word of BANNED_WORDS) {
    const pattern = new RegExp(`\\b${escapeRegExp(word)}\\b`, "gi");
    const hits = combined.match(pattern);

    for (let index = 0; index < (hits?.length ?? 0); index += 1) {
      reasons.push(`banned word: ${word}`);
    }
  }

  const expectedSubject = `Operations audit for ${lead.business_name}`;

  if (
    draft.subject !== expectedSubject ||
    !/^Operations audit for .+$/.test(draft.subject)
  ) {
    reasons.push(`subject must be exactly '${expectedSubject}'`);
  }

  if (!hasPersonalization(draft.body, lead)) {
    reasons.push(
      "personalization: body must reference business_name, city, owner_name, or trade_type",
    );
  }

  return { pass: reasons.length === 0, reasons };
}

export function validateRaw(jsonString: string): ValidationResult {
  let parsed: {
    draft: { subject: string; body: string };
    lead: MinimalLead;
  };

  try {
    parsed = JSON.parse(jsonString) as {
      draft: { subject: string; body: string };
      lead: MinimalLead;
    };
  } catch {
    return { pass: false, reasons: ["invalid JSON"] };
  }

  return validate(parsed.draft, parsed.lead);
}

function hasPersonalization(body: string, lead: MinimalLead): boolean {
  const normalizedBody = body.toLowerCase();
  const fields = [
    lead.business_name,
    lead.city,
    lead.owner_name,
    lead.trade_type,
  ];

  return fields.some((field) => {
    if (field === null || field === undefined || field.length < 4) {
      return false;
    }

    return normalizedBody.includes(field.toLowerCase());
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
