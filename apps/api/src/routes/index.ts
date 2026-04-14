import { FastifyInstance } from "fastify";
import { appConfig } from "../config.js";

export async function indexRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return {
      name: appConfig.name,
      version: appConfig.version,
      status: "running",
    };
  });
}
