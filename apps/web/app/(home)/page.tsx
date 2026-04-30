import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ClipboardCheck,
  Crosshair,
  FileWarning,
  MapPinned,
  MessagesSquare,
  Route,
  ShieldAlert,
  ShieldCheck,
  Target,
  Telescope,
  Timer,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import styles from "./landing.module.css";

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.82-.255.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function GithubCtaLink({ href }: { href: string }) {
  return (
    <Link className={styles.githubCta} href={href}>
      <GitHubMark className={styles.githubCtaIcon} />
      Continue with GitHub
    </Link>
  );
}

function SectionRow({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className={styles.sectionListItem}>
      <span className={styles.rowIcon}>
        <Icon size={22} strokeWidth={1.75} aria-hidden />
      </span>
      <div className={styles.rowBody}>
        <span className={styles.itemLabel}>{title}</span>
        {children}
      </div>
    </li>
  );
}

export default function Home() {
  const githubHref = "/api/auth/signin/github";

  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroInner}>
          <p className={styles.kicker}>Know the risk before you merge</p>
          <h1 id="hero-heading">See what a dependency upgrade can break</h1>
          <p className={styles.heroLead}>
            MergeSignal analyzes your dependency changes and shows where real
            runtime issues are likely to occur, so your team knows exactly what
            to verify before merging.
          </p>
          <div className={styles.heroActions}>
            <GithubCtaLink href={githubHref} />
          </div>
        </div>
      </section>

      <div className={styles.sectionStack}>
        <section className={styles.sectionCard} aria-labelledby="pain-heading">
          <div className={styles.sectionHead}>
            <h2 id="pain-heading" className={styles.h2}>
              Why dependency upgrades are hard to review
            </h2>
            <p className={styles.subhead}>
              Upgrading is easy. Knowing what it actually affects is not.
            </p>
          </div>
          <ul className={styles.sectionList}>
            <SectionRow
              icon={FileWarning}
              title="Changelogs don’t show real impact"
            >
              They list changes, but not how those changes affect your code
              paths, flows, and edge cases.
            </SectionRow>
            <SectionRow
              icon={ShieldAlert}
              title="Too much signal, not enough clarity"
            >
              Security tools and alerts create noise, but rarely show what
              actually matters for this specific PR.
            </SectionRow>
            <SectionRow
              icon={Route}
              title="Runtime impact is hard to reason about"
            >
              Understanding how a change flows through auth, middleware, and
              critical paths requires context most reviews do not have.
            </SectionRow>
          </ul>
        </section>

        <section className={styles.sectionCard} aria-labelledby="focus-heading">
          <div className={styles.sectionHead}>
            <h2 id="focus-heading" className={styles.h2}>
              What MergeSignal focuses on
            </h2>
            <p className={styles.subhead}>
              Less noise. Clear answers about what actually matters.
            </p>
          </div>
          <ul className={styles.sectionList}>
            <SectionRow icon={Crosshair} title="What can break">
              Highlights likely failure modes based on how your code uses the
              updated dependencies.
            </SectionRow>
            <SectionRow icon={MapPinned} title="Where it can break">
              Points to the exact parts of your app affected, including auth
              flows, middleware, and critical paths.
            </SectionRow>
            <SectionRow
              icon={ClipboardCheck}
              title="What to verify before merging"
            >
              Provides concrete checks so your team knows exactly what needs to
              be validated for this upgrade.
            </SectionRow>
          </ul>
        </section>

        {/* <section className={styles.sectionCard} aria-labelledby="how-heading">
          <div className={styles.sectionHead}>
            <h2 id="focus-heading" className={styles.h2}>
              How it works
            </h2>
            <p className={styles.subhead}>
              From dependency changes to clear, actionable insight.
            </p>
          </div>
          <ul className={styles.sectionList}>
            <SectionRow icon={Crosshair} title="Scan dependency changes">
              Detects version updates and maps how updated packages are actually
              used across your codebase.
            </SectionRow>
            <SectionRow icon={MapPinned} title="Focus on real impact">
              Prioritizes changes that are most likely to affect runtime
              behavior, not a full list of every possible issue.
            </SectionRow>
            <SectionRow icon={ClipboardCheck} title="Trace critical paths">
              Analyzes how changes propagate through auth, middleware, and other
              user-facing flows.
            </SectionRow>
            <SectionRow icon={ClipboardCheck} title="Deliver clear next steps">
              Provides concise guidance on what could break, why it matters, and
              what to verify before merging.
            </SectionRow>
          </ul>
        </section> */}

        {/* <section
          className={styles.sectionCard}
          aria-labelledby="features-heading"
        >
          <div className={styles.sectionHead}>
            <h2 id="features-heading" className={styles.h2}>
              What you get in every PR
            </h2>
            <p className={styles.subhead}>
              Clear, focused insight into what actually matters.
            </p>
          </div>
          <ul className={styles.sectionList}>
            <SectionRow icon={GitBranch} title="Usage-aware analysis">
              Connects dependency changes to the parts of your code that
              actually use them.
            </SectionRow>
            <SectionRow icon={ListFilter} title="Prioritized insight">
              Surfaces a small set of high-impact items so reviews start in the
              right place.
            </SectionRow>
            <SectionRow icon={Activity} title="Real runtime context">
              Shows where issues are likely to appear, across auth, middleware,
              and critical flows.
            </SectionRow>
            <SectionRow icon={Layers} title="Actionable next steps">
              Actionable next steps
            </SectionRow>
          </ul>
        </section> */}

        <section className={styles.sectionCard} aria-labelledby="value-heading">
          <div className={styles.sectionHead}>
            <h2 id="value-heading" className={styles.h2}>
              What changes when you use MergeSignal
            </h2>
            <p className={styles.subhead}>
              Faster decisions, fewer surprises, and more confident merges.
            </p>
          </div>
          <ul className={styles.sectionList}>
            <SectionRow icon={ShieldCheck} title="Reviews move faster">
              Focus on the right risks instead of reconstructing impact from
              changelogs and scattered context.
            </SectionRow>
            <SectionRow icon={Timer} title="Testing becomes targeted">
              Effort goes to the flows that matter, not spread across the entire
              system.
            </SectionRow>
            <SectionRow icon={Target} title="Fewer production surprises">
              Issues are caught while changes are still small and easy to fix.
            </SectionRow>
            <SectionRow icon={UsersRound} title="Teams stay aligned">
              Everyone works from the same understanding of risk before merging.
            </SectionRow>
          </ul>
        </section>

        <section
          className={`${styles.sectionCard} ${styles.sectionCardAccent}`}
          aria-labelledby="position-heading"
        >
          <div className={styles.sectionHead}>
            <h2 id="position-heading" className={styles.h2}>
              Built for clarity
            </h2>
            <p className={styles.subhead}>
              MergeSignal focuses on what can actually affect your application,
              and turns it into insight your team can act on.
            </p>
          </div>
          <ul className={styles.sectionList}>
            <SectionRow icon={Telescope} title="Depth where it matters">
              Surfaces a small set of high-impact risks based on how your code
              uses updated dependencies.
            </SectionRow>
            <SectionRow
              icon={MessagesSquare}
              title="Clear, actionable language"
            >
              Explains impact in plain terms your team can use directly in
              reviews and decisions.
            </SectionRow>
          </ul>
        </section>
      </div>

      <section className={styles.finalCta} aria-labelledby="final-heading">
        <h2 id="final-heading" className={styles.finalTag}>
          Try it on your next upgrade PR
        </h2>
        <p className={styles.finalLead}>
          Connect GitHub when you&apos;re ready to scan a repo; until then, this
          page is here to explain how MergeSignal thinks about dependency risk.
        </p>
        <GithubCtaLink href={githubHref} />
      </section>

      <section className={styles.sectionCard} aria-labelledby="docs-heading">
        <div className={styles.sectionHead}>
          <h2 id="docs-heading" className={styles.h2}>
            Install, CI, and GitHub
          </h2>
          <p className={styles.subhead}>
            Run locally, wire Actions or the App, and scan PRs with confidence.
          </p>
        </div>
        <ul className={styles.sectionList}>
          <SectionRow icon={BookOpen} title="Documentation">
            Follow{" "}
            <Link className={styles.inlineLink} href="/getting-started">
              Getting started
            </Link>{" "}
            on this site for install, CI, and PR scanning, or open{" "}
            <Link
              className={styles.inlineLink}
              href="https://github.com/MergeSignal/mergesignal/blob/main/docs/github-app.md"
            >
              GitHub App setup
            </Link>{" "}
            in the repository for webhook and permission details.
          </SectionRow>
        </ul>
      </section>
    </>
  );
}
