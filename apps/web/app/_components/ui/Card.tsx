import styles from "./Card.module.css";

export function Card({
  title,
  subtitle,
  children,
  padding = true,
  as = "section",
}: {
  title?: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  padding?: boolean;
  as?: "section" | "div";
}) {
  const Tag = as;
  return (
    <Tag
      className={[styles.card, padding ? "" : styles.noPadding]
        .filter(Boolean)
        .join(" ")}
    >
      {title ? <h2 className={styles.title}>{title}</h2> : null}
      {subtitle ? <p className={styles.muted}>{subtitle}</p> : null}
      {children}
    </Tag>
  );
}

export { styles as cardStyles };
