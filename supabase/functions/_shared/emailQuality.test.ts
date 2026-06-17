import { describe, expect, it } from 'vitest';

import { classifyEmail } from './emailQuality';

describe('classifyEmail', () => {
  it('classifies null as missing', () => {
    expect(classifyEmail(null)).toMatchObject({
      tier: 'missing',
      cleanedEmail: null,
      reason: 'no email provided',
    });
  });

  it('classifies undefined as missing', () => {
    expect(classifyEmail(undefined)).toMatchObject({
      tier: 'missing',
      cleanedEmail: null,
      reason: 'no email provided',
    });
  });

  it('classifies an empty string as missing', () => {
    expect(classifyEmail('')).toMatchObject({
      tier: 'missing',
      cleanedEmail: null,
      reason: 'no email provided',
    });
  });

  it('classifies literal null as missing', () => {
    expect(classifyEmail('null')).toMatchObject({
      tier: 'missing',
      cleanedEmail: null,
      reason: 'no email provided',
    });
  });

  it('strips mailto before classifying generic prefixes', () => {
    expect(classifyEmail('mailto:info@co.com')).toMatchObject({
      tier: 'generic',
      cleanedEmail: 'info@co.com',
      reason: 'generic inbox prefix',
    });
  });

  it('classifies empty mailto as invalid', () => {
    expect(classifyEmail('mailto:')).toMatchObject({
      tier: 'invalid',
      cleanedEmail: null,
      reason: 'mailto: with no address',
    });
  });

  it('classifies protected email placeholders as invalid', () => {
    expect(classifyEmail('[email&#160;protected]')).toMatchObject({
      tier: 'invalid',
      cleanedEmail: null,
      reason: 'cloudflare-encoded — not decoded',
    });
  });

  it('classifies cloudflare encoded markers as invalid', () => {
    expect(classifyEmail('test@__cf_email__')).toMatchObject({
      tier: 'invalid',
      cleanedEmail: null,
      reason: 'cloudflare-encoded — not decoded',
    });
  });

  it('classifies malformed emails as invalid', () => {
    expect(classifyEmail('not-an-email')).toMatchObject({
      tier: 'invalid',
      cleanedEmail: null,
      reason: 'malformed email',
    });
  });

  it('classifies generic inbox prefixes', () => {
    expect(classifyEmail('info@company.com')).toMatchObject({
      tier: 'generic',
      cleanedEmail: 'info@company.com',
      reason: 'generic inbox prefix',
    });
  });

  it('classifies local-parts matching the owner first name as owner personal', () => {
    expect(classifyEmail('mike@smithplumbing.ca', 'Mike Smith')).toMatchObject({
      tier: 'owner-personal',
      cleanedEmail: 'mike@smithplumbing.ca',
      reason: 'local-part matches owner first name',
    });
  });

  it('classifies business names on free providers as business gmail', () => {
    expect(classifyEmail('smithplumbing@gmail.com', undefined, 'Smith Plumbing')).toMatchObject({
      tier: 'business-gmail',
      cleanedEmail: 'smithplumbing@gmail.com',
      reason: 'business email on free provider',
    });
  });

  it('classifies domain emails with unclear owner identity as domain unclear', () => {
    expect(classifyEmail('random@somecorp.com')).toMatchObject({
      tier: 'domain-unclear',
      cleanedEmail: 'random@somecorp.com',
      reason: 'domain email, owner identity unclear',
    });
  });
});
