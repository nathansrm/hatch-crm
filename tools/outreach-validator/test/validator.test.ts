import assert from 'node:assert/strict';
import test from 'node:test';
import { validate, validateRaw, type MinimalLead } from '../src/validator.ts';

const lead: MinimalLead = { business_name: 'Acme Plumbing' };

function bodyWith(reference: string, targetWordCount = 88): string {
  const words = reference.trim().split(/\s+/).filter(Boolean);
  let index = 0;

  while (words.length < targetWordCount) {
    words.push(`crew${index}`);
    index += 1;
  }

  return words.slice(0, targetWordCount).join(' ');
}

function resultFor(body: string, subject = 'Operations audit for Acme Plumbing') {
  return validate({ subject, body }, lead);
}

test('valid 88-word body with Acme Plumbing in body passes', () => {
  assert.deepEqual(resultFor(bodyWith('Acme Plumbing')), { pass: true, reasons: [] });
});

test('body with leverage reports banned word', () => {
  const result = resultFor(bodyWith('Acme Plumbing leverage'));

  assert.equal(result.pass, false);
  assert.ok(result.reasons.includes('banned word: leverage'));
});

test('body with em dash reports em dash reason', () => {
  const result = resultFor(bodyWith('Acme Plumbing —'));

  assert.equal(result.pass, false);
  assert.ok(result.reasons.includes('em dash not allowed'));
});

test('body with en dash reports en dash reason', () => {
  const result = resultFor(bodyWith('Acme Plumbing –'));

  assert.equal(result.pass, false);
  assert.ok(result.reasons.includes('en dash not allowed'));
});

test('65-word body reports low word count', () => {
  const result = resultFor(bodyWith('Acme Plumbing', 65));

  assert.equal(result.pass, false);
  assert.ok(result.reasons.includes('word count: 65 (must be 80–110)'));
});

test('132-word body reports high word count', () => {
  const result = resultFor(bodyWith('Acme Plumbing', 132));

  assert.equal(result.pass, false);
  assert.ok(result.reasons.includes('word count: 132 (must be 80–110)'));
});

test('wrong subject prefix reports subject mismatch', () => {
  const result = resultFor(bodyWith('Acme Plumbing'), 'Audit for Acme Plumbing');

  assert.equal(result.pass, false);
  assert.ok(result.reasons.includes("subject must be exactly 'Operations audit for Acme Plumbing'"));
});

test('right subject prefix with wrong company reports subject mismatch', () => {
  const result = resultFor(bodyWith('Acme Plumbing'), 'Operations audit for Beta Plumbing');

  assert.equal(result.pass, false);
  assert.ok(result.reasons.includes("subject must be exactly 'Operations audit for Acme Plumbing'"));
});

test('valid body with no lead field matches reports personalization reason', () => {
  const result = resultFor(bodyWith('nearby crews'));

  assert.equal(result.pass, false);
  assert.ok(
    result.reasons.includes(
      'personalization: body must reference business_name, city, owner_name, or trade_type'
    )
  );
});

test('personalization via city field passes', () => {
  const result = validate(
    { subject: 'Operations audit for Acme Plumbing', body: bodyWith('Denver') },
    { business_name: 'Acme Plumbing', city: 'Denver' }
  );

  assert.deepEqual(result, { pass: true, reasons: [] });
});

test('personalization via owner_name field passes', () => {
  const result = validate(
    { subject: 'Operations audit for Acme Plumbing', body: bodyWith('Maria Lopez') },
    { business_name: 'Acme Plumbing', owner_name: 'Maria Lopez' }
  );

  assert.deepEqual(result, { pass: true, reasons: [] });
});

test('validateRaw with invalid JSON reports invalid JSON', () => {
  assert.deepEqual(validateRaw('not-json'), { pass: false, reasons: ['invalid JSON'] });
});

test('multi-reason validation collects banned word, word count, and personalization', () => {
  const result = resultFor(bodyWith('leverage', 65));

  assert.equal(result.pass, false);
  assert.ok(result.reasons.includes('banned word: leverage'));
  assert.ok(result.reasons.includes('word count: 65 (must be 80–110)'));
  assert.ok(
    result.reasons.includes(
      'personalization: body must reference business_name, city, owner_name, or trade_type'
    )
  );
});
