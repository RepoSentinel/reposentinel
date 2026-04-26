import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.links}>
          <Link
            href="https://github.com/MergeSignal/mergesignal"
            className={styles.link}
          >
            GitHub
          </Link>
          <span className={styles.separator}>•</span>
          <Link
            href="https://github.com/MergeSignal/mergesignal/blob/main/TERMS.md"
            className={styles.link}
          >
            Terms of Service
          </Link>
          <span className={styles.separator}>•</span>
          <Link
            href="https://github.com/MergeSignal/mergesignal/blob/main/PRIVACY.md"
            className={styles.link}
          >
            Privacy Policy
          </Link>
          <span className={styles.separator}>•</span>
          <Link
            href="https://github.com/MergeSignal/mergesignal/blob/main/API-TERMS.md"
            className={styles.link}
          >
            API Terms
          </Link>
          <span className={styles.separator}>•</span>
          <Link
            href="https://github.com/MergeSignal/mergesignal/blob/main/CONTACT.md"
            className={styles.link}
          >
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

        <div className={styles.copyright}>© 2026 MergeSignal</div>
      </div>
    </footer>
  );
}
