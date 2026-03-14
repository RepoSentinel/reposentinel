import Fastify from "fastify";
import "dotenv/config";
import cors from "@fastify/cors";
import rawBody from "fastify-raw-body";
import { indexRoutes } from "./routes/index.js";
import { healthRoutes } from "./routes/health.js";
import { scanRoutes } from "./routes/scan.js";
import { scanEventsRoutes } from "./routes/scanEvents.js";
import { simulateUpgradeRoutes } from "./routes/simulateUpgrade.js";
import { githubWebhookRoutes } from "./routes/githubWebhook.js";
import { orgDashboardRoutes } from "./routes/orgDashboard.js";
import { alertsRoutes } from "./routes/alerts.js";
import { policiesRoutes } from "./routes/policies.js";
import { benchmarkRoutes } from "./routes/benchmark.js";
import { runMigrationsIfEnabled } from "./migrate.js";

async function start() {
  const app = Fastify({ logger: true });

  await runMigrationsIfEnabled((msg) => app.log.info(msg));

  await app.register(rawBody, {
    field: "rawBody",
    global: false,
    encoding: "utf8",
    runFirst: true,
  });

  const allowedOrigins = new Set(
    (process.env.CORS_ORIGINS ?? "http://localhost:3000,http://127.0.0.1:3000")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );

  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      cb(null, allowedOrigins.has(origin));
    },
    credentials: false,
  });

  app.register(indexRoutes);
  app.register(healthRoutes);
  app.register(scanRoutes);
  app.register(scanEventsRoutes);
  app.register(simulateUpgradeRoutes);
  app.register(githubWebhookRoutes);
  app.register(orgDashboardRoutes);
  app.register(alertsRoutes);
  app.register(policiesRoutes);
  app.register(benchmarkRoutes);

  const port = Number(process.env.PORT ?? 4000);
  const host = process.env.HOST ?? "0.0.0.0";

  app.listen({ port, host }).catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
