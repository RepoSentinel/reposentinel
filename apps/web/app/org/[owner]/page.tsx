import Link from "next/link";
import { AppShell } from "../../_components/AppShell";

type Dashboard = {
  owner: string;
  summary: {
    repoCount: number;
    scoredRepoCount: number;
    avgScore: number | null;
    worst: Array<{ repoId: string; totalScore: number }>;
  };
  repos: Array<{
    repoId: string;
    latest: {
      scanId: string;
      status: string;
      totalScore: number | null;
      methodologyVersion: string | null;
      createdAt: string;
    };
    deltaTotalScore?: number | null;
  }>;
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ owner: string }>;
  searchParams?: Promise<{ limit?: string }>;
}) {
  const { owner } = await params;
  const sp = (await searchParams) ?? {};
  const limit = sp.limit ? Number(sp.limit) : 50;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  const res = await fetch(`${baseUrl}/org/${encodeURIComponent(owner)}/dashboard?limit=${limit}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    return <AppShell title="Org dashboard" subtitle={owner} owner={owner}><pre>{text}</pre></AppShell>;
  }

  const data = (await res.json()) as Dashboard;

  return (
    <AppShell
      title="Org dashboard"
      subtitle={`repos: ${data.summary.repoCount} • scored: ${data.summary.scoredRepoCount} • avg: ${
        data.summary.avgScore ?? "n/a"
      }`}
      owner={owner}
    >
      <div className="rs-card" style={{ padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 820 }}>
            <thead>
              <tr>
                {["Repo", "Score", "Δ", "Status", "Last scan", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid var(--border)",
                      padding: "10px 12px",
                      whiteSpace: "nowrap",
                      fontSize: 12,
                      opacity: 0.8,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.repos.map((r) => (
                <tr key={r.repoId}>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                    <code>{r.repoId}</code>
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                    <b>{r.latest.totalScore ?? "n/a"}</b>
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                    {typeof r.deltaTotalScore === "number"
                      ? r.deltaTotalScore > 0
                        ? `+${r.deltaTotalScore}`
                        : `${r.deltaTotalScore}`
                      : "—"}
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                    {r.latest.status}
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                    {new Date(r.latest.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                    <Link href={`/scan/${r.latest.scanId}`}>Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data.summary.worst.length > 0 ? (
        <div className="rs-note">
          Worst scores:{" "}
          {data.summary.worst.map((w, i) => (
            <span key={w.repoId}>
              <code>{w.repoId}</code> ({w.totalScore})
              {i < data.summary.worst.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>
      ) : null}
    </AppShell>
  );
}

