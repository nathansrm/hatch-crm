export type EmailTier =
  | 'owner-personal'
  | 'business-gmail'
  | 'domain-unclear'
  | 'generic'
  | 'invalid'
  | 'missing';

export interface EmailClassification {
  tier: EmailTier;
  cleanedEmail: string | null;
  reason: string;
}

export const GENERIC_PREFIXES: readonly string[] = [
  'info',
  'contact',
  'sales',
  'support',
  'admin',
  'office',
  'hello',
  'inquiries',
  'booking',
  'customerservice',
  'frontdesk',
  'general',
  'help',
  'service',
];

const FREE_PROVIDER_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
];

const EMAIL_PATTERN = /^[\w.+-]+@[\w.-]+\.\w{2,}$/;

function firstAlphaWord(value: string | undefined): string {
  const firstWord = value?.trim().split(/\s+/)[0] ?? '';
  return firstWord.toLowerCase().replace(/[^a-z]/g, '');
}

export function classifyEmail(
  rawEmail: string | null | undefined,
  ownerName?: string,
  businessName?: string,
): EmailClassification {
  const trimmedEmail = rawEmail?.trim() ?? '';

  if (trimmedEmail === '' || trimmedEmail.toLowerCase() === 'null') {
    return {
      tier: 'missing',
      cleanedEmail: null,
      reason: 'no email provided',
    };
  }

  const withoutMailto = trimmedEmail.toLowerCase().startsWith('mailto:')
    ? trimmedEmail.slice('mailto:'.length).trim()
    : trimmedEmail;

  if (withoutMailto === '') {
    return {
      tier: 'invalid',
      cleanedEmail: null,
      reason: 'mailto: with no address',
    };
  }

  if (
    withoutMailto.includes('[email&#160;protected]') ||
    withoutMailto.includes('__cf_email__')
  ) {
    return {
      tier: 'invalid',
      cleanedEmail: null,
      reason: 'cloudflare-encoded — not decoded',
    };
  }

  const cleanedEmail = withoutMailto.toLowerCase();

  if (!EMAIL_PATTERN.test(cleanedEmail)) {
    return {
      tier: 'invalid',
      cleanedEmail: null,
      reason: 'malformed email',
    };
  }

  const atIndex = cleanedEmail.indexOf('@');
  const localPart = cleanedEmail.slice(0, atIndex);
  const domain = cleanedEmail.slice(atIndex + 1);
  const lowerLocalPart = localPart.toLowerCase();

  if (GENERIC_PREFIXES.includes(lowerLocalPart)) {
    return {
      tier: 'generic',
      cleanedEmail,
      reason: 'generic inbox prefix',
    };
  }

  const isFreeProvider = FREE_PROVIDER_DOMAINS.includes(domain);
  const businessFirstWord = firstAlphaWord(businessName);

  if (isFreeProvider && businessFirstWord !== '' && lowerLocalPart.includes(businessFirstWord)) {
    return {
      tier: 'business-gmail',
      cleanedEmail,
      reason: 'business email on free provider',
    };
  }

  const ownerFirstName = firstAlphaWord(ownerName);

  if (ownerFirstName !== '' && lowerLocalPart.startsWith(ownerFirstName)) {
    return {
      tier: 'owner-personal',
      cleanedEmail,
      reason: 'local-part matches owner first name',
    };
  }

  if (!isFreeProvider) {
    return {
      tier: 'domain-unclear',
      cleanedEmail,
      reason: 'domain email, owner identity unclear',
    };
  }

  return {
    tier: 'domain-unclear',
    cleanedEmail,
    reason: 'unclassified',
  };
}
