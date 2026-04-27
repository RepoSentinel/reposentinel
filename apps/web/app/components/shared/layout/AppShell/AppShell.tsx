import Image from "next/image";
import Link from "next/link";
import styles from "./AppShell.module.css";
import { Footer } from "../Footer/Footer";
import { UserNav } from "../UserNav/UserNav";

export function AppShell({
  title,
  subtitle,
  owner,
  linkedOwner,
  hideTitlebar,
  /** Marketing / info-only pages: logo in header only (no auth or org nav). */
  hideHeaderNav,
  /** Legal pages: copyright only (no footer link row). */
  footerVariant = "full",
  mainWidth = "default",
  children,
}: {
  title: string;
  subtitle?: string;
  owner?: string;
  /** Shown in header for quick dashboard link when signed in. */
  linkedOwner?: string;
  /** Omit the built-in H1 block (e.g. marketing pages render their own hero). */
  hideTitlebar?: boolean;
  hideHeaderNav?: boolean;
  footerVariant?: "full" | "minimal";
  mainWidth?: "default" | "wide";
  children: React.ReactNode;
}) {
  const showNav = !hideHeaderNav;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.brand}>
            <Image
              src="/mergesignal-logo.png"
              alt="MergeSignal"
              width={1024}
              height={680}
              className={styles.brandLogo}
              priority
            />
          </Link>
          {owner ? <span className={styles.owner}>/ {owner}</span> : null}
        </div>
        {showNav ? (
          <nav className={styles.nav}>
            {owner ? (
              <>
                <Link
                  className={styles.navLink}
                  href={`/org/${encodeURIComponent(owner)}`}
                >
                  Dashboard
                </Link>
                <Link
                  className={styles.navLink}
                  href={`/org/${encodeURIComponent(owner)}/alerts`}
                >
                  Alerts
                </Link>
                <Link
                  className={styles.navLink}
                  href={`/org/${encodeURIComponent(owner)}/policies`}
                >
                  Policies
                </Link>
                <Link
                  className={styles.navLink}
                  href={`/org/${encodeURIComponent(owner)}/benchmark`}
                >
                  Benchmark
                </Link>
              </>
            ) : null}
            <UserNav linkedOwner={linkedOwner} />
          </nav>
        ) : null}
      </header>

      <main
        className={
          mainWidth === "wide"
            ? `${styles.main} ${styles.mainWide}`
            : styles.main
        }
      >
        {hideTitlebar ? null : (
          <div className={styles.titlebar}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
        )}
        {children}
      </main>

      <Footer variant={footerVariant} />
    </div>
  );
}
