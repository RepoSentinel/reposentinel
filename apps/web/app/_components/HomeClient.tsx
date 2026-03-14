"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export function HomeClient() {
  const router = useRouter();
  const [owner, setOwner] = useState("demo");
  const [scanId, setScanId] = useState("");
  const [repoId, setRepoId] = useState("demo/repo");

  const ownerPath = useMemo(() => `/org/${encodeURIComponent(owner.trim() || "demo")}`, [owner]);
  const scanPath = useMemo(() => `/scan/${encodeURIComponent(scanId.trim())}`, [scanId]);

  return (
    <div className="rs-grid">
      <section className="rs-card">
        <h2 className="rs-card__title">Organization dashboard</h2>
        <p className="rs-muted">Type an owner (prefix of `repoId`, e.g. `acme`).</p>
        <div className="rs-row">
          <input
            className="rs-input"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="acme"
          />
          <button className="rs-button" onClick={() => router.push(ownerPath)}>
            Open
          </button>
        </div>
      </section>

      <section className="rs-card">
        <h2 className="rs-card__title">Scan results</h2>
        <p className="rs-muted">Paste a scan id to open its live page.</p>
        <div className="rs-row">
          <input
            className="rs-input"
            value={scanId}
            onChange={(e) => setScanId(e.target.value)}
            placeholder="b803812d-d035-4c27-99ee-b77c49a865f2"
          />
          <button
            className="rs-button"
            onClick={() => router.push(scanPath)}
            disabled={!scanId.trim()}
          >
            Open
          </button>
        </div>
      </section>

      <section className="rs-card">
        <h2 className="rs-card__title">Repo percentile</h2>
        <p className="rs-muted">Uses latest scored scan for the repo.</p>
        <div className="rs-row">
          <input
            className="rs-input"
            value={repoId}
            onChange={(e) => setRepoId(e.target.value)}
            placeholder="acme/repo-a"
          />
          <a
            className="rs-button rs-button--secondary"
            href={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/benchmark/repo?repoId=${encodeURIComponent(repoId.trim())}`}
            target="_blank"
            rel="noreferrer"
          >
            View JSON
          </a>
        </div>
      </section>
    </div>
  );
}

