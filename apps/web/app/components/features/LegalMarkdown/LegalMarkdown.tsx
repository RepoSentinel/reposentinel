import { MarkdownContent } from "../../shared/MarkdownContent/MarkdownContent";
import { readLegalDoc } from "../../../../lib/readLegalDoc";
import styles from "./LegalDoc.module.css";

const DOC_FILES = {
  terms: "terms.md",
  privacy: "privacy.md",
  "api-terms": "api-terms.md",
  contact: "contact.md",
} as const;

export type LegalDocId = keyof typeof DOC_FILES;

export function LegalMarkdown({ doc }: { doc: LegalDocId }) {
  const source = readLegalDoc(DOC_FILES[doc]);
  return (
    <article className={styles.article}>
      <MarkdownContent>{source}</MarkdownContent>
    </article>
  );
}
