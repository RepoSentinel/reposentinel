"use client";

import { useEffect, useState } from "react";

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

  if (err) return <div className="rs-card">Error: {err}</div>;
  if (!data) return <div className="rs-card">Connecting…</div>;

  const score = data.result?.totalScore;
  const layers = data.result?.layerScores;
  const recs = Array.isArray(data.result?.recommendations) ? data.result.recommendations : [];
  const findings = Array.isArray(data.result?.findings) ? data.result.findings : [];

  return (
    <div className="rs-grid">
      <section className="rs-card">
        <h2 className="rs-card__title">Status</h2>
        <p className="rs-muted">
          <b>{data.status}</b>
        </p>
        {data.status === "running" || data.status === "queued" ? (
          <div className="rs-note">This page updates automatically.</div>
        ) : null}
      </section>

      <section className="rs-card">
        <h2 className="rs-card__title">Risk score</h2>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 6 }}>
          {typeof score === "number" ? score : "n/a"}
        </div>
        {layers ? (
          <div className="rs-note">
            security: <b>{layers.security}</b> • maintainability: <b>{layers.maintainability}</b> • ecosystem:{" "}
            <b>{layers.ecosystem}</b> • upgradeImpact: <b>{layers.upgradeImpact}</b>
          </div>
        ) : (
          <div className="rs-muted">No layer breakdown yet.</div>
        )}
      </section>

      {data.status === "done" && (
        <section className="rs-card">
          <h2 className="rs-card__title">Top actions</h2>
          {recs.length === 0 ? (
            <div className="rs-muted">No recommendations yet.</div>
          ) : (
            <ol style={{ marginTop: 10, paddingLeft: 18 }}>
              {recs.slice(0, 5).map((r: any) => (
                <li key={String(r.id ?? r.title)}>
                  <b>{String(r.title ?? "Untitled")}</b>{" "}
                  <span className="rs-muted">({Number(r.priorityScore ?? 0)})</span>
                </li>
              ))}
            </ol>
          )}
          {findings.length ? (
            <div className="rs-note">Findings: <b>{findings.length}</b></div>
          ) : null}
        </section>
      )}

      {data.status === "failed" && (
        <section className="rs-card">
          <h2 className="rs-card__title">Failure</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{data.error}</pre>
        </section>
      )}

      <section className="rs-card">
        <h2 className="rs-card__title">Details</h2>
        <div className="rs-row">
          <button className="rs-button rs-button--secondary" onClick={() => setShowRaw((s) => !s)}>
            {showRaw ? "Hide" : "Show"} raw JSON
          </button>
        </div>
        {showRaw ? <pre style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>{JSON.stringify(data, null, 2)}</pre> : null}
      </section>
    </div>
  );
}
