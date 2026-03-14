import { AppShell } from "../../../_components/AppShell";

type PoliciesResponse = {
  owner: string;
  policies: Array<{
    id: string;
    owner: string;
    name: string;
    enabled: boolean;
    rules: any;
    created_at: string;
    updated_at: string;
  }>;
};

type ViolationsResponse = {
  owner: string;
  repoId: string | null;
  violations: Array<{
    id: string;
    policy_id: string;
    owner: string;
    repo_id: string;
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
  const [pRes, vRes] = await Promise.all([
    fetch(`${baseUrl}/org/${encodeURIComponent(owner)}/policies`, { cache: "no-store" }),
    fetch(`${baseUrl}/org/${encodeURIComponent(owner)}/policy/violations?limit=${limit}`, { cache: "no-store" }),
  ]);

  if (!pRes.ok || !vRes.ok) {
    const t1 = await pRes.text();
    const t2 = await vRes.text();
    return (
      <AppShell title="Policies" subtitle={owner} owner={owner}>
        <pre style={{ whiteSpace: "pre-wrap" }}>{t1}</pre>
        <pre style={{ whiteSpace: "pre-wrap" }}>{t2}</pre>
      </AppShell>
    );
  }

  const policies = (await pRes.json()) as PoliciesResponse;
  const violations = (await vRes.json()) as ViolationsResponse;

  return (
    <AppShell
      title="Policies"
      subtitle={`policies: ${policies.policies.length} • recent violations: ${violations.violations.length}`}
      owner={owner}
    >
      <h2 style={{ marginTop: 6 }}>Policies</h2>
      {policies.policies.length === 0 ? (
        <div className="rs-card">
          <div className="rs-muted">No policies yet. Create one via API:</div>
          <pre style={{ whiteSpace: "pre-wrap" }}>
{`curl -X POST "${baseUrl}/org/${owner}/policies" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"baseline","enabled":true,"rules":[{"type":"no_deprecated"},{"type":"max_stale_releases_count","max":3}]}'`}
          </pre>
        </div>
      ) : (
        <ul>
          {policies.policies.map((p) => (
            <li key={p.id}>
              <b>{p.name}</b> ({p.enabled ? "enabled" : "disabled"}){" "}
              <code>{p.id}</code>
              <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(p.rules, null, 2)}</pre>
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ marginTop: 18 }}>Recent violations</h2>
      <div className="rs-card" style={{ padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
          <thead>
            <tr>
              {["Time", "Repo", "Severity", "Title", "Policy"].map((h) => (
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
            {violations.violations.map((v) => (
              <tr key={v.id}>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                  {new Date(v.created_at).toLocaleString()}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                  <code>{v.repo_id}</code>
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>{v.severity}</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>{v.title}</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                  <code>{v.policy_id}</code>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      {violations.violations.length > 0 && (
        <>
          <h2 style={{ marginTop: 18 }}>Latest violation details</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(violations.violations[0]?.details ?? null, null, 2)}
          </pre>
        </>
      )}
    </AppShell>
  );
}

