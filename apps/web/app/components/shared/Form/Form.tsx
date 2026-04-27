import styles from "./Form.module.css";

export function Row({ children }: { children: React.ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[styles.input, props.className].filter(Boolean).join(" ")}
    />
  );
}

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary";
  },
) {
  const variant = props.variant ?? "primary";
  const cls = [
    styles.button,
    variant === "secondary" ? styles.buttonSecondary : "",
    props.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return <button {...props} className={cls} />;
}

export function ButtonLink(
  props: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    variant?: "primary" | "secondary";
  },
) {
  const variant = props.variant ?? "secondary";
  const cls = [
    styles.button,
    variant === "secondary" ? styles.buttonSecondary : "",
    props.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return <a {...props} className={cls} />;
}

export { styles as formStyles };
