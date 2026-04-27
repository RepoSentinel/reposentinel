import type { ReactNode } from "react";

import styles from "./SiteChrome.module.css";

export function ShellTitlebar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: ReactNode;
}) {
  return (
    <div className={styles.titlebar}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
    </div>
  );
}
