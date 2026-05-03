import "server-only";

import fs from "node:fs";
import path from "node:path";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");
const GITHUB_APP_FILE = "github-app.md";

/** Markdown for the GitHub App section on the single-page getting started guide. */
export function readGithubAppDocumentationMarkdown(): string {
  return fs.readFileSync(path.join(DOCS_DIR, GITHUB_APP_FILE), "utf8");
}
