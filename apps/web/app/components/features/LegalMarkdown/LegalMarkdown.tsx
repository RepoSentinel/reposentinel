import Link from "next/link";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { readLegalDoc } from "../../../../lib/readLegalDoc";
import { AppShell } from "../../shared/layout/AppShell/AppShell";
import styles from "./LegalDoc.module.css";

const DOC_FILES = {
  terms: "terms.md",
  privacy: "privacy.md",
  "api-terms": "api-terms.md",
  contact: "contact.md",
} as const;

export type LegalDocId = keyof typeof DOC_FILES;

const markdownComponents: Partial<Components> = {
  a({ href, children }) {
    if (href?.startsWith("/")) {
      return <Link href={href}>{children}</Link>;
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
};

export function LegalMarkdown({ doc }: { doc: LegalDocId }) {
  const source = readLegalDoc(DOC_FILES[doc]);
  return (
    <AppShell
      title="MergeSignal"
      hideTitlebar
      hideHeaderNav
      footerVariant="minimal"
      mainWidth="default"
    >
      <article className={styles.article}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {source}
        </ReactMarkdown>
      </article>
    </AppShell>
  );
}
