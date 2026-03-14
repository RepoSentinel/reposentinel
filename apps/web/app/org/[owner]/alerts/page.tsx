import { AppShell } from "../../../_components/AppShell";

type OrgAlerts = {
  owner: string;
  alerts: Array<{
    id: string;
    repo_id: string;
    type: string;
    severity: string;
    title: string;
    details: any;
    created_at: string;
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
  const limit = sp.limit ? Number(sp.limit) : 100;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  const res = await fetch(
    `${baseUrl}/org/${encodeURIComponent(owner)}/alerts?limit=${limit}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    const text = await res.text();
    return (
      <AppShell title="Alerts" subtitle={owner} owner={owner}>
        <pre style={{ whiteSpace: "pre-wrap" }}>{text}</pre>
      </AppShell>
    );
  }

  const data = (await res.json()) as OrgAlerts;

  return (
    <AppShell title="Alerts" subtitle={`recent: ${data.alerts.length}`} owner={owner}>
      <div className="rs-card" style={{ padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
          <thead>
            <tr>
              {["Time", "Repo", "Severity", "Title", "Type"].map((h) => (
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
            {data.alerts.map((a) => (
              <tr key={a.id}>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                  {new Date(a.created_at).toLocaleString()}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                  <code>{a.repo_id}</code>
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>{a.severity}</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>{a.title}</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                  <code>{a.type}</code>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      {data.alerts.length > 0 && (
        <>
          <h2 style={{ marginTop: 18 }}>Latest alert details</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(data.alerts[0]?.details ?? null, null, 2)}
          </pre>
        </>
      )}
    </AppShell>
  );
}

