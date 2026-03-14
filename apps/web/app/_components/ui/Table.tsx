import styles from "./Table.module.css";

export function DataTable({
  headers,
  minWidth,
  rows,
}: {
  headers: string[];
  minWidth?: number;
  rows: React.ReactNode;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.wrap}>
        <table className={styles.table} style={minWidth ? { minWidth } : undefined}>
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h} className={styles.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    </div>
  );
}

export function TD({ children }: { children: React.ReactNode }) {
  return <td className={styles.td}>{children}</td>;
}

export { styles as tableStyles };

