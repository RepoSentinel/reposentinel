import { FastifyInstance } from "fastify";
import { db } from "../db";

export async function scanEventsRoutes(app: FastifyInstance) {
  app.get("/scan/:id/events", async (req, reply) => {
    const id = (req.params as any).id as string;

    //reply.header("Access-Control-Allow-Origin", "http://localhost:3000");
    reply.header("Content-Type", "text/event-stream");
    reply.header("Cache-Control", "no-cache");
    reply.header("Connection", "keep-alive");

    reply.raw.flushHeaders?.();
    /*
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });*/

    const send = (event: string, data: unknown) => {
      reply.raw.write(`event: ${event}\n`);
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // שליחה ראשונית
    const first = await db.query(
      "SELECT id, status, result, error, updated_at FROM scans WHERE id=$1",
      [id],
    );
    if (first.rows.length === 0) {
      send("error", { message: "Not found" });
      reply.raw.end();
      return;
    }
    send("status", first.rows[0]);

    if (first.rows[0].status === "done" || first.rows[0].status === "failed") {
      reply.raw.end();
      return;
    }
    // Poll פנימי (בשרת) כל 1 שניה ודחיפה ללקוח רק אם השתנה
    let lastUpdated = String(first.rows[0].updated_at);

    const interval = setInterval(async () => {
      try {
        const { rows } = await db.query(
          "SELECT id, status, result, error, updated_at FROM scans WHERE id=$1",
          [id],
        );
        if (rows.length === 0) {
          send("error", { message: "Not found" });
          clearInterval(interval);
          reply.raw.end();
          return;
        }

        const updated = String(rows[0].updated_at);
        if (updated !== lastUpdated) {
          lastUpdated = updated;
          send("status", rows[0]);

          if (rows[0].status === "done" || rows[0].status === "failed") {
            clearInterval(interval);
            reply.raw.end();
          }
        }
      } catch (e: any) {
        send("error", { message: String(e?.message ?? e) });
        clearInterval(interval);
        reply.raw.end();
      }
    }, 1000);

    req.raw.on("close", () => {
      clearInterval(interval);
    });
  });
}
