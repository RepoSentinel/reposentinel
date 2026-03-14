import Fastify from "fastify";
import { runMigrationsIfEnabled } from "./migrate.js";
import { registerRoutes } from "./routes/register.js";
import { registerRequestId } from "./http/requestId.js";
import { registerErrorHandling } from "./http/errors.js";
import { registerRawBody } from "./http/rawBody.js";
import { registerCors } from "./http/cors.js";
import { registerAuth } from "./http/auth.js";

export async function createApp() {
  const app = Fastify({ logger: true });

  await runMigrationsIfEnabled((msg) => app.log.info(msg));

  registerRequestId(app);
  registerErrorHandling(app);

  await registerRawBody(app);
  await registerCors(app);
  registerAuth(app);

  await registerRoutes(app);

  return app;
}

