import "dotenv/config";
import Fastify from "fastify";
import { runMigrationsIfEnabled } from "./migrate.js";

const app = Fastify({ logger: true });

await runMigrationsIfEnabled((msg) => app.log.info(msg));

await app.close();
