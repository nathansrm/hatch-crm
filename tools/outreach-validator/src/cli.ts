#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { validate } from "./validator.js";

declare const process: {
  argv: string[];
  stdout: { write(data: string): boolean };
  exit(code?: number): never;
};

const inputIndex = process.argv.indexOf("--input");
const leadIndex = process.argv.indexOf("--lead");
const inputPath = inputIndex === -1 ? undefined : process.argv[inputIndex + 1];
const leadPath = leadIndex === -1 ? undefined : process.argv[leadIndex + 1];

if (!inputPath || !leadPath) {
  console.error(
    "usage: node dist/cli.js --input <draft.json> --lead <lead.json>",
  );
  process.exit(2);
}

try {
  const draft = JSON.parse(readFileSync(inputPath, "utf8")) as {
    subject: string;
    body: string;
  };
  const lead = JSON.parse(readFileSync(leadPath, "utf8")) as {
    business_name: string;
    city?: string;
    owner_name?: string;
    trade_type?: string;
  };
  const result = validate(draft, lead);
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exit(result.pass ? 0 : 1);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
}
