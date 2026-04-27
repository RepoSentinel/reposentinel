import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer({ variant = "full" }: { variant?: "full" | "minimal" }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {variant === "full" ? (
          <div className={styles.links}>
            <Link
              href="https://github.com/MergeSignal/mergesignal"
              className={styles.link}
            >
              GitHub
            </Link>
            <span className={styles.separator}>•</span>
            <Link href="/terms" className={styles.link}>
              Terms of Service
            </Link>
            <span className={styles.separator}>•</span>
            <Link href="/privacy" className={styles.link}>
              Privacy Policy
            </Link>
            <span className={styles.separator}>•</span>
            <Link href="/api-terms" className={styles.link}>
              API Terms
            </Link>
            <span className={styles.separator}>•</span>
            <Link href="/contact" className={styles.link}>
              Contact
            </Link>
            <span className={styles.separator}>•</span>
            <Link
              href="https://github.com/MergeSignal/mergesignal/blob/main/LICENSE"
              className={styles.link}
            >
              Apache 2.0 License
            </Link>
          </div>
        ) : null}

        <div className={styles.copyright}>© 2026 MergeSignal</div>
      </div>
    </footer>
  );
}
