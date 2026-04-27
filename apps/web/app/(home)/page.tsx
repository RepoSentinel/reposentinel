import Link from "next/link";
import styles from "./landing.module.css";

export default function Home() {
  const githubHref = "/api/auth/signin/github";

  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroInner}>
          <p className={styles.kicker}>Dependency risk, before you merge</p>
          <h1 id="hero-heading" className={styles.heroTitle}>
            Understand what an upgrade can break—before it ships
          </h1>
          <p className={styles.heroLead}>
            MergeSignal reads your dependency diff and how those packages are
            used in your code, then surfaces runtime-style risks in plain
            language so reviewers know what to check first.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.githubCta} href={githubHref}>
              Continue with GitHub
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="pain-heading">
        <div className={styles.sectionHead}>
          <h2 id="pain-heading" className={styles.h2}>
            Why dependency upgrades are hard to review
          </h2>
          <p className={styles.subhead}>
            Version bumps are routine; understanding their blast radius is not.
          </p>
        </div>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            <span className={styles.itemLabel}>
              Release notes hide behavior
            </span>
            Breaking or risky changes are easy to miss when you only scan
            changelogs.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.itemLabel}>Security tools add noise</span>A
            flood of findings makes it hard to see what actually matters for
            this PR.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.itemLabel}>
              Reviews rarely trace runtime
            </span>
            Most reviewers cannot mentally simulate how an upgrade touches auth,
            middleware, and critical paths.
          </li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="focus-heading">
        <div className={styles.sectionHead}>
          <h2 id="focus-heading" className={styles.h2}>
            What MergeSignal emphasizes
          </h2>
          <p className={styles.subhead}>
            Signal over volume: fewer items, each tied to how your app runs.
          </p>
        </div>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            <span className={styles.itemLabel}>What could break</span>
            Likely failure modes—not every advisory or theoretical issue.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.itemLabel}>Where it could break</span>
            Auth flows, middleware, hooks, and other paths that actually ship.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.itemLabel}>
              What to verify before merge
            </span>
            Concrete checks so the team agrees on what “done” looks like for
            this upgrade.
          </li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="how-heading">
        <div className={styles.sectionHead}>
          <h2 id="how-heading" className={styles.h2}>
            How it works
          </h2>
          <p className={styles.subhead}>
            From the lockfile diff to decision-ready notes in four steps.
          </p>
        </div>
        <ol className={`${styles.sectionList} ${styles.sectionListOrdered}`}>
          <li className={styles.sectionListItem}>
            <span className={styles.listStepNum} aria-hidden>
              1
            </span>
            <div className={styles.listStepBody}>
              <span className={styles.itemLabel}>Scan dependency changes</span>
              Detects version updates and how updated packages are referenced
              across the repo.
            </div>
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.listStepNum} aria-hidden>
              2
            </span>
            <div className={styles.listStepBody}>
              <span className={styles.itemLabel}>
                Prioritize plausible impact
              </span>
              Highlights changes most likely to affect runtime—not an exhaustive
              inventory of every finding.
            </div>
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.listStepNum} aria-hidden>
              3
            </span>
            <div className={styles.listStepBody}>
              <span className={styles.itemLabel}>Stress critical paths</span>
              Goes deeper on flows that tend to carry user-facing risk, instead
              of treating the tree as a flat list of files.
            </div>
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.listStepNum} aria-hidden>
              4
            </span>
            <div className={styles.listStepBody}>
              <span className={styles.itemLabel}>Ship concise guidance</span>
              Short explanations: what might break, why it matters, what to test
              or confirm next.
            </div>
          </li>
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="features-heading">
        <div className={styles.sectionHead}>
          <h2 id="features-heading" className={styles.h2}>
            What you get
          </h2>
          <p className={styles.subhead}>
            Built for reviewers and maintainers who need clarity under time
            pressure.
          </p>
        </div>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            <span className={styles.itemLabel}>
              Usage-aware dependency analysis
            </span>
            Connects manifest changes to real call sites—not only what bumped in
            the lockfile.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.itemLabel}>Readable, ranked insight</span>
            Surfaces a small set of high-signal items so the first pass of
            review goes to the right places.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.itemLabel}>Runtime-shaped scenarios</span>
            Frames how things could fail in production terms, for example:
            <ul className={styles.nestedBullets}>
              <li>broken request or response handling</li>
              <li>validation or auth edge regressions</li>
              <li>ordering and concurrency surprises</li>
            </ul>
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.itemLabel}>Context, not just alerts</span>
            Points to where risk concentrates: middleware, lifecycle hooks,
            shared clients, and similar choke points.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.itemLabel}>Actionable next steps</span>
            Each item suggests what to verify, automate, or double-check before
            merge.
          </li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="value-heading">
        <div className={styles.sectionHead}>
          <h2 id="value-heading" className={styles.h2}>
            Why teams reach for it
          </h2>
          <p className={styles.subhead}>
            Outcomes you can explain to engineering leadership in one slide.
          </p>
        </div>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            <span className={styles.itemLabel}>Fewer surprise incidents</span>
            Catch dependency-driven breakage while the diff is still small and
            cheap to fix.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.itemLabel}>Faster PR reviews</span>
            Minutes on targeted signal instead of hours re-deriving impact from
            docs and threads.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.itemLabel}>Smarter test investment</span>
            Aim depth where runtime impact is plausible, not everywhere at once.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.itemLabel}>Shared mental model</span>
            Everyone sees the same picture of what could go wrong before the
            green button.
          </li>
        </ul>
      </section>

      <section
        className={`${styles.section} ${styles.accentPanel}`}
        aria-labelledby="position-heading"
      >
        <div className={styles.sectionHead}>
          <h2 id="position-heading" className={styles.h2}>
            Not another “find everything” scanner
          </h2>
          <p className={styles.subhead}>
            MergeSignal is intentionally narrow: dependency shifts that can
            change how your application behaves, explained so your team can act.
          </p>
        </div>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            <span className={styles.itemLabel}>Depth where it counts</span>
            Skips vanity counts in favor of a short list tied to this PR&apos;s
            dependency graph and usage.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.itemLabel}>
              Language your team already uses
            </span>
            Outcomes and checks you can paste into a review comment or ticket—no
            proprietary jargon required.
          </li>
        </ul>
      </section>

      <section className={styles.finalCta} aria-labelledby="final-heading">
        <h2 id="final-heading" className={styles.finalTag}>
          Try it on your next upgrade PR
        </h2>
        <p className={styles.finalLead}>
          Connect GitHub when you&apos;re ready to scan a repo; until then, this
          page is here to explain how MergeSignal thinks about dependency risk.
        </p>
        <Link className={styles.githubCta} href={githubHref}>
          Continue with GitHub
        </Link>
      </section>

      <section className={styles.section} aria-labelledby="docs-heading">
        <div className={styles.sectionHead}>
          <h2 id="docs-heading" className={styles.h2}>
            GitHub App &amp; self-hosting
          </h2>
          <p className={styles.subhead}>
            Permissions, webhooks, and environment variables for operators.
          </p>
        </div>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            <span className={styles.itemLabel}>Documentation</span>
            See{" "}
            <Link
              className={styles.inlineLink}
              href="https://github.com/MergeSignal/mergesignal/blob/main/docs/github-app.md"
            >
              GitHub App setup (docs)
            </Link>{" "}
            in the open-source repository.
          </li>
        </ul>
      </section>
    </>
  );
}
