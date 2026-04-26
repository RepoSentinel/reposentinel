import "server-only";

import fs from "node:fs";
import path from "node:path";

const LEGAL_DIR = path.join(process.cwd(), "content", "legal");

const ALLOWED = new Set([
  "terms.md",
  "privacy.md",
  "api-terms.md",
  "contact.md",
]);

export function readLegalDoc(filename: string): string {
  if (!ALLOWED.has(filename)) {
    throw new Error(`Invalid legal document: ${filename}`);
  }
  return fs.readFileSync(path.join(LEGAL_DIR, filename), "utf8");
}
