import "dotenv/config";
import { Octokit } from "octokit";
import Fastify from "fastify";
import { runMigrationsIfEnabled } from "./migrate.js";

const app = Fastify({ logger: true });

app.log.info(
  { octokitSdk: Octokit.name },
  "migration cli (octokit on path for scans)",
);

await runMigrationsIfEnabled((msg) => app.log.info(msg));

await app.close();
