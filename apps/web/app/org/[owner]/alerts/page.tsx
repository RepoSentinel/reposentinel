import { AppShell } from "../../../_components/AppShell";
import { DataTable, TD } from "../../../_components/ui/Table";
import typo from "../../../_styles/typography.module.css";

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
      <DataTable
        headers={["Time", "Repo", "Severity", "Title", "Type"]}
        minWidth={900}
        rows={data.alerts.map((a) => (
          <tr key={a.id}>
            <TD>{new Date(a.created_at).toLocaleString()}</TD>
            <TD>
              <code>{a.repo_id}</code>
            </TD>
            <TD>{a.severity}</TD>
            <TD>{a.title}</TD>
            <TD>
              <code>{a.type}</code>
            </TD>
          </tr>
        ))}
      />

      {data.alerts.length > 0 && (
        <>
          <h2 className={typo.h2}>Latest alert details</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(data.alerts[0]?.details ?? null, null, 2)}
          </pre>
        </>
      )}
    </AppShell>
  );
}

