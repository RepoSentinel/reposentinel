import type { Metadata } from "next";

import { LegalMarkdown } from "../../components/features/LegalMarkdown/LegalMarkdown";

export const metadata: Metadata = {
  title: "API Terms — MergeSignal",
  description:
    "API rate limits, quotas, authentication, and acceptable use for the MergeSignal API.",
};

export default function ApiTermsPage() {
  return <LegalMarkdown doc="api-terms" />;
}
