import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

function getSqlDir() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.join(here, "..", "sql");
}

export async function runMigrationsIfEnabled(log: (msg: string) => void) {
  const enabled = (process.env.REPOSENTINEL_AUTO_MIGRATE ?? "1") === "1";
  if (!enabled) return;
  await runMigrations(log);
}

async function runMigrations(log: (msg: string) => void) {
  const sqlDir = getSqlDir();
  const files = (await readdir(sqlDir))
    .filter((f) => /^\d+_.+\.sql$/.test(f))
    .sort((a, b) => a.localeCompare(b));

  const scansExists = await hasTable("scans");

  for (const f of files) {
    if (f.startsWith("001_")) {
      if (scansExists) continue;
      await applyFile(sqlDir, f, log);
      continue;
    }

    await applyFile(sqlDir, f, log);
  }
}

async function hasTable(name: string) {
  const { rows } = await db.query("SELECT to_regclass($1) AS t", [`public.${name}`]);
  return Boolean(rows?.[0]?.t);
}

async function applyFile(sqlDir: string, filename: string, log: (msg: string) => void) {
  const full = path.join(sqlDir, filename);
  const sql = await readFile(full, "utf8");
  const trimmed = sql.trim();
  if (!trimmed) return;

  log(`migrate: applying ${filename}`);
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(trimmed);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

