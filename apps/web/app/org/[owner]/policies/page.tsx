import Link from "next/link";

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
      <div style={{ padding: 16 }}>
        <h1>Policies: {owner}</h1>
        <pre>{t1}</pre>
        <pre>{t2}</pre>
      </div>
    );
  }

  const policies = (await pRes.json()) as PoliciesResponse;
  const violations = (await vRes.json()) as ViolationsResponse;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0 }}>Policies: {owner}</h1>
          <div style={{ opacity: 0.8, marginTop: 6 }}>
            policies: <b>{policies.policies.length}</b> • recent violations:{" "}
            <b>{violations.violations.length}</b>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignSelf: "center" }}>
          <Link href={`/org/${encodeURIComponent(owner)}`}>Dashboard</Link>
          <Link href={`/org/${encodeURIComponent(owner)}/alerts`}>Alerts</Link>
          <Link href="/">Home</Link>
        </div>
      </div>

      <h2 style={{ marginTop: 18 }}>Policies</h2>
      {policies.policies.length === 0 ? (
        <div style={{ opacity: 0.8 }}>
          No policies yet. Create one via API:
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
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
          <thead>
            <tr>
              {["Time", "Repo", "Severity", "Title", "Policy"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: "10px 8px",
                    whiteSpace: "nowrap",
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
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>
                  {new Date(v.created_at).toLocaleString()}
                </td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>
                  <code>{v.repo_id}</code>
                </td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>{v.severity}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>{v.title}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>
                  <code>{v.policy_id}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {violations.violations.length > 0 && (
        <>
          <h2 style={{ marginTop: 18 }}>Latest violation details</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(violations.violations[0]?.details ?? null, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}

