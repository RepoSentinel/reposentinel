import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.disclaimer}>
          <strong>⚠️ Important Disclaimer:</strong> MergeSignal is provided
          &ldquo;as is&rdquo; without warranty of any kind. This tool is{" "}
          <strong>not a substitute for professional security audits</strong>.
          You are solely responsible for validating all recommendations and risk
          scores before acting on them. No security guarantees are provided.
        </div>

        <div className={styles.links}>
          <Link
            href="https://github.com/[your-org]/mergesignal"
            className={styles.link}
          >
            GitHub
          </Link>
          <span className={styles.separator}>•</span>
          <Link
            href="https://github.com/[your-org]/mergesignal/blob/main/TERMS.md"
            className={styles.link}
          >
            Terms of Service
          </Link>
          <span className={styles.separator}>•</span>
          <Link
            href="https://github.com/[your-org]/mergesignal/blob/main/PRIVACY.md"
            className={styles.link}
          >
            Privacy Policy
          </Link>
          <span className={styles.separator}>•</span>
          <Link
            href="https://github.com/[your-org]/mergesignal/blob/main/API-TERMS.md"
            className={styles.link}
          >
            API Terms
          </Link>
          <span className={styles.separator}>•</span>
          <Link
            href="https://github.com/[your-org]/mergesignal/blob/main/CONTACT.md"
            className={styles.link}
          >
            Contact
          </Link>
          <span className={styles.separator}>•</span>
          <Link
            href="https://github.com/[your-org]/mergesignal/blob/main/LICENSE"
            className={styles.link}
          >
            Apache 2.0 License
          </Link>
        </div>

        <div className={styles.copyright}>
          © 2026 MergeSignal. All analysis is informational only. Validate all
          outputs before use.
        </div>
      </div>
    </footer>
  );
}
