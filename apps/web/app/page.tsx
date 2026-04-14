import { AppShell } from "./_components/AppShell";
import { HomeClient } from "./_components/HomeClient";
import { cardStyles } from "./_components/ui/Card";

export default function Home() {
  return (
    <AppShell
      title="Dependency risk, made actionable"
      subtitle="Quickly find what’s risky, why it matters, and what to fix next."
    >
      <HomeClient />
      <div className={cardStyles.note}>
        Tip: use <code>repoId</code> format <code>owner/repo</code> (e.g.{" "}
        <code>acme/repo-a</code>).
      </div>
    </AppShell>
  );
}
