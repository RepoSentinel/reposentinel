import Link from "next/link";
import { AppShell } from "./_components/AppShell";
import styles from "./landing.module.css";

export default function Home() {
  const linkedOwner = process.env.MERGESIGNAL_LINKED_GITHUB_OWNER?.trim();
  const githubHref = "/api/auth/signin/github";

  return (
    <AppShell
      title="MergeSignal"
      linkedOwner={linkedOwner}
      hideTitlebar
      mainWidth="wide"
    >
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroInner}>
          <p className={styles.kicker}>Merge smart.</p>
          <h1 id="hero-heading" className={styles.heroTitle}>
            Understand dependency risk before you merge
          </h1>
          <p className={styles.heroLead}>
            MergeSignal analyzes your dependency changes and predicts real
            runtime risks, so you can make confident decisions before code
            reaches production.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.githubCta} href={githubHref}>
              Continue with GitHub
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="why-heading">
        <div className={styles.sectionHead}>
          <h2 id="why-heading" className={styles.h2}>
            Why this matters
          </h2>
          <p className={styles.subhead}>
            Upgrading dependencies is one of the most common sources of
            production issues.
          </p>
        </div>
        <ul className={styles.bullets}>
          <li>Breaking changes are often unclear from release notes alone.</li>
          <li>
            Security tools flood you with noise that is hard to prioritize.
          </li>
          <li>Pull request reviews rarely explain real runtime impact.</li>
        </ul>
        <p className={`${styles.p} ${styles.pSpaced}`}>
          Instead of listing issues, MergeSignal focuses on what matters:
        </p>
        <ul className={styles.focusList}>
          <li>
            <span className={styles.focusGlyph} aria-hidden>
              ◆
            </span>
            <span>
              <strong className={styles.focusStrong}>What can break</strong> —
              likely failure modes, not every advisory.
            </span>
          </li>
          <li>
            <span className={styles.focusGlyph} aria-hidden>
              ◆
            </span>
            <span>
              <strong className={styles.focusStrong}>Where it can break</strong>{" "}
              — auth flows, middleware, hooks, and critical paths.
            </span>
          </li>
          <li>
            <span className={styles.focusGlyph} aria-hidden>
              ◆
            </span>
            <span>
              <strong className={styles.focusStrong}>
                What you should verify
              </strong>{" "}
              — concrete checks before you merge.
            </span>
          </li>
        </ul>
        <p className={`${styles.p} ${styles.pSpaced} ${styles.pEmphasis}`}>
          No noise. No guesswork. Just decisions.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="how-heading">
        <div className={styles.sectionHead}>
          <h2 id="how-heading" className={styles.h2}>
            How it works
          </h2>
        </div>
        <ol className={styles.steps}>
          <li className={styles.stepCard}>
            <div className={styles.stepNum}>1</div>
            <h3 className={styles.stepTitle}>Scan your dependency changes</h3>
            <p className={styles.stepBody}>
              MergeSignal analyzes version updates and how updated packages are
              used across your codebase.
            </p>
          </li>
          <li className={styles.stepCard}>
            <div className={styles.stepNum}>2</div>
            <h3 className={styles.stepTitle}>Prioritize real risks</h3>
            <p className={styles.stepBody}>
              It highlights changes most likely to impact runtime behavior—not
              every theoretical finding.
            </p>
          </li>
          <li className={styles.stepCard}>
            <div className={styles.stepNum}>3</div>
            <h3 className={styles.stepTitle}>
              Deep analysis of critical paths
            </h3>
            <p className={styles.stepBody}>
              Instead of treating the repo as a flat bag of files, it emphasizes
              the flows that actually ship.
            </p>
          </li>
          <li className={styles.stepCard}>
            <div className={styles.stepNum}>4</div>
            <h3 className={styles.stepTitle}>Clear, decision-grade insights</h3>
            <p className={styles.stepBody}>
              Concise explanations of what might break, why it matters, and what
              to verify next.
            </p>
          </li>
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="features-heading">
        <div className={styles.sectionHead}>
          <h2 id="features-heading" className={styles.h2}>
            Key features
          </h2>
        </div>
        <div className={styles.grid3}>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>Dependency-aware analysis</h3>
            <p className={styles.cardBody}>
              Understands how updated packages are actually used in your
              code—not only what changed in the manifest.
            </p>
          </article>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>Clear insights</h3>
            <p className={styles.cardBody}>
              No long lists of warnings. Surfaces the most relevant,
              high-confidence risks so reviewers know where to look first.
            </p>
          </article>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>Runtime-focused predictions</h3>
            <p className={styles.cardBody}>
              Frames likely failure scenarios such as:
            </p>
            <ul className={styles.scenarioList}>
              <li>broken request flows</li>
              <li>incorrect responses</li>
              <li>skipped validation</li>
              <li>race conditions</li>
            </ul>
          </article>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>Context, not just alerts</h3>
            <p className={styles.cardBody}>
              Shows where risk lives: auth flows, middleware, lifecycle hooks,
              and critical paths.
            </p>
          </article>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>Actionable next steps</h3>
            <p className={styles.cardBody}>
              Every insight points to what to verify, what to test, and what to
              confirm before merging.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="value-heading">
        <div className={styles.sectionHead}>
          <h2 id="value-heading" className={styles.h2}>
            Why teams use MergeSignal
          </h2>
        </div>
        <div className={styles.valueGrid}>
          <div className={styles.valueItem}>
            <strong>Reduce production incidents</strong>
            <span>
              Catch dependency-driven breakage earlier in the review cycle.
            </span>
          </div>
          <div className={styles.valueItem}>
            <strong>Save time in PR reviews</strong>
            <span>Spend minutes on signal instead of hours on noise.</span>
          </div>
          <div className={styles.valueItem}>
            <strong>Avoid unnecessary deep testing</strong>
            <span>Target verification where runtime impact is plausible.</span>
          </div>
          <div className={styles.valueItem}>
            <strong>Make faster, safer decisions</strong>
            <span>
              Merge with a shared picture of what could actually go wrong.
            </span>
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.positioning}`}
        aria-labelledby="position-heading"
      >
        <div className={styles.sectionHead}>
          <h2 id="position-heading" className={styles.h2}>
            Not another scanner
          </h2>
        </div>
        <p className={styles.p}>
          MergeSignal does not try to find everything. It focuses on what
          matters for your pull request: dependency shifts that can change how
          your application behaves at runtime, explained in language your team
          can act on.
        </p>
      </section>

      <section className={styles.finalCta} aria-labelledby="final-heading">
        <h2 id="final-heading" className={styles.finalTag}>
          Merge smarter.
        </h2>
        <p className={styles.finalLead}>
          Start using MergeSignal and understand your risks before they reach
          production.
        </p>
        <Link className={styles.githubCta} href={githubHref}>
          Continue with GitHub
        </Link>
      </section>

      <p className={styles.installNote}>
        Using the GitHub App? See{" "}
        <Link
          className={styles.inlineLink}
          href="https://github.com/MergeSignal/mergesignal/blob/main/docs/github-app.md"
        >
          GitHub App setup (docs)
        </Link>{" "}
        for permissions, webhooks, and environment variables.
      </p>
    </AppShell>
  );
}
