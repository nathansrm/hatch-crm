import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { BANNED_WORDS } from '../src/banned-words.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const contract = readFileSync(join(__dirname, '../contract.md'), 'utf8');

test('contract.md lists every banned word', () => {
  for (const word of BANNED_WORDS) {
    assert.ok(contract.includes(word), `contract.md missing banned word: ${word}`);
  }
});
