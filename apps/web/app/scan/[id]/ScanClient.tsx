"use client";

import { useEffect, useState } from "react";
import styles from "./ScanClient.module.css";
import layoutStyles from "./ScanClientLayout.module.css";
import { Card, cardStyles } from "../../_components/ui/Card";
import { Button, Row } from "../../_components/ui/Form";

type ScanRow = {
  id: string;
  status: "queued" | "running" | "done" | "failed";
  result?: any;
  error?: string | null;
};

export default function ScanClient({ id }: { id: string }) {
  const [data, setData] = useState<ScanRow | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    const es = new EventSource(`${baseUrl}/scan/${id}/events`);

    es.addEventListener("status", (e) => {
      try {
        setData(JSON.parse((e as MessageEvent).data));
      } catch {
        setErr("Failed to parse SSE payload");
      }
    });

    es.addEventListener("error", () => {
      setErr((prev) => prev ?? "SSE connection issue (retrying)");
    });

    return () => es.close();
  }, [id]);

  if (err) return <Card title="Error">{err}</Card>;
  if (!data) return <Card title="Connecting">Waiting for events…</Card>;

  const score = data.result?.totalScore;
  const layers = data.result?.layerScores;
  const recs = Array.isArray(data.result?.recommendations) ? data.result.recommendations : [];
  const findings = Array.isArray(data.result?.findings) ? data.result.findings : [];

  return (
    <div className={layoutStyles.grid}>
      <Card title="Status" subtitle={<b>{data.status}</b>}>
        {data.status === "running" || data.status === "queued" ? (
          <div className={cardStyles.note}>This page updates automatically.</div>
        ) : null}
      </Card>

      <Card title="Risk score">
        <div className={styles.score}>{typeof score === "number" ? score : "n/a"}</div>
        {layers ? (
          <div className={cardStyles.note}>
            security: <b>{layers.security}</b> • maintainability: <b>{layers.maintainability}</b> • ecosystem:{" "}
            <b>{layers.ecosystem}</b> • upgradeImpact: <b>{layers.upgradeImpact}</b>
          </div>
        ) : (
          <div className={cardStyles.muted}>No layer breakdown yet.</div>
        )}
      </Card>

      {data.status === "done" && (
        <Card title="Top actions">
          {recs.length === 0 ? (
            <div className={cardStyles.muted}>No recommendations yet.</div>
          ) : (
            <ol style={{ marginTop: 10, paddingLeft: 18 }}>
              {recs.slice(0, 5).map((r: any) => (
                <li key={String(r.id ?? r.title)}>
                  <b>{String(r.title ?? "Untitled")}</b>{" "}
                  <span className={cardStyles.muted}>({Number(r.priorityScore ?? 0)})</span>
                </li>
              ))}
            </ol>
          )}
          {findings.length ? (
            <div className={cardStyles.note}>
              Findings: <b>{findings.length}</b>
            </div>
          ) : null}
        </Card>
      )}

      {data.status === "failed" && (
        <Card title="Failure">
          <pre style={{ whiteSpace: "pre-wrap" }}>{data.error}</pre>
        </Card>
      )}

      <Card title="Details">
        <Row>
          <Button variant="secondary" onClick={() => setShowRaw((s) => !s)}>
            {showRaw ? "Hide" : "Show"} raw JSON
          </Button>
        </Row>
        {showRaw ? <pre className={styles.detailsPre}>{JSON.stringify(data, null, 2)}</pre> : null}
      </Card>
    </div>
  );
}
