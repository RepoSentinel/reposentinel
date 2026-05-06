import styles from "./BrandWordmark.module.css";

export function BrandWordmark() {
  return (
    <span className={styles.wordmark} aria-label="MergeSignal - Merge Smart">
      <span className={styles.name}>MergeSignal</span>
      <span className={styles.tagline}>MERGE SMART.</span>
    </span>
  );
}
