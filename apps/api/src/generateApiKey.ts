#!/usr/bin/env node
import { randomBytes, createHash } from "crypto";
import { db } from "./db.js";
import { randomUUID } from "crypto";

async function generateApiKey(owner: string, description?: string) {
  if (!owner || owner.trim() === "") {
    console.error("Error: owner is required");
    process.exit(1);
  }

  const apiKey = `rs_${randomBytes(32).toString("hex")}`;
  const keyHash = createHash("sha256").update(apiKey).digest("hex");
  const id = randomUUID();

  try {
    await db.query(
      "INSERT INTO api_keys (id, key_hash, owner, description, created_at) VALUES ($1, $2, $3, $4, NOW())",
      [id, keyHash, owner, description ?? null],
    );

    console.log("\n✅ API Key generated successfully!\n");
    console.log("Owner:", owner);
    console.log("Description:", description ?? "(none)");
    console.log("Key ID:", id);
    console.log("\n🔑 API Key (save this securely, it won't be shown again):");
    console.log(apiKey);
    console.log("\nUse this key in the Authorization header:");
    console.log(`Authorization: Bearer ${apiKey}`);
    console.log();
  } catch (err: any) {
    console.error("Error generating API key:", err.message);
    process.exit(1);
  } finally {
    await db.end();
  }
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage: npm run generate-api-key -- <owner> [description]

Examples:
  npm run generate-api-key -- acme "Production API key"
  npm run generate-api-key -- octocat

Arguments:
  owner         GitHub organization or user name
  description   Optional description for the API key
`);
  process.exit(args.includes("--help") || args.includes("-h") ? 0 : 1);
}

const owner = args[0];
const description = args.slice(1).join(" ");

generateApiKey(owner, description);
