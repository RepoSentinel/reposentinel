import Link from "next/link";
import { AppShell } from "../../_components/AppShell";
import { DataTable, TD } from "../../_components/ui/Table";
import { cardStyles } from "../../_components/ui/Card";

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
    return (
      <AppShell title="Org dashboard" subtitle={owner} owner={owner}>
        <pre style={{ whiteSpace: "pre-wrap" }}>{text}</pre>
      </AppShell>
    );
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
      <DataTable
        headers={["Repo", "Score", "Δ", "Status", "Last scan", ""]}
        rows={data.repos.map((r) => (
          <tr key={r.repoId}>
            <TD>
              <code>{r.repoId}</code>
            </TD>
            <TD>
              <b>{r.latest.totalScore ?? "n/a"}</b>
            </TD>
            <TD>
              {typeof r.deltaTotalScore === "number"
                ? r.deltaTotalScore > 0
                  ? `+${r.deltaTotalScore}`
                  : `${r.deltaTotalScore}`
                : "—"}
            </TD>
            <TD>{r.latest.status}</TD>
            <TD>{new Date(r.latest.createdAt).toLocaleString()}</TD>
            <TD>
              <Link href={`/scan/${r.latest.scanId}`}>Open</Link>
            </TD>
          </tr>
        ))}
      />

      {data.summary.worst.length > 0 ? (
        <div className={cardStyles.note}>
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

