import { createPrivateKey, createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const role = process.argv[2];

if (role !== "anon" && role !== "service_role") {
  console.error("Usage: node scripts/generate-e2e-jwt.mjs <anon|service_role>");
  process.exit(1);
}

const [jwk] = JSON.parse(readFileSync("supabase/signing_keys.json", "utf8"));
const key = createPrivateKey({ key: jwk, format: "jwk" });

const encode = (value) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

const header = encode({
  alg: "ES256",
  kid: jwk.kid,
  typ: "JWT",
});

const payload = encode({
  role,
  iss: "supabase",
  sub: role,
  iat: 1700000000,
  exp: 2145916800,
});

const signingInput = `${header}.${payload}`;
const sign = createSign("SHA256");
sign.update(signingInput);
sign.end();

const signature = sign
  .sign({ key, dsaEncoding: "ieee-p1363" })
  .toString("base64url");

console.log(`${signingInput}.${signature}`);
