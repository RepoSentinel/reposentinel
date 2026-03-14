import Link from "next/link";

export function AppShell({
  title,
  subtitle,
  owner,
  children,
}: {
  title: string;
  subtitle?: string;
  owner?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rs-page">
      <header className="rs-header">
        <div className="rs-header__left">
          <Link href="/" className="rs-brand">
            RepoSentinel
          </Link>
          {owner ? <span className="rs-owner">/ {owner}</span> : null}
        </div>
        <nav className="rs-nav">
          {owner ? (
            <>
              <Link className="rs-nav__link" href={`/org/${encodeURIComponent(owner)}`}>
                Dashboard
              </Link>
              <Link className="rs-nav__link" href={`/org/${encodeURIComponent(owner)}/alerts`}>
                Alerts
              </Link>
              <Link className="rs-nav__link" href={`/org/${encodeURIComponent(owner)}/policies`}>
                Policies
              </Link>
              <Link className="rs-nav__link" href={`/org/${encodeURIComponent(owner)}/benchmark`}>
                Benchmark
              </Link>
            </>
          ) : (
            <Link className="rs-nav__link" href="/org/demo">
              Org demo
            </Link>
          )}
        </nav>
      </header>

      <main className="rs-main">
        <div className="rs-titlebar">
          <h1 className="rs-title">{title}</h1>
          {subtitle ? <p className="rs-subtitle">{subtitle}</p> : null}
        </div>
        {children}
      </main>
    </div>
  );
}

