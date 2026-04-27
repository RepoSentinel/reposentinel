import type { Metadata } from "next";

import { LegalMarkdown } from "../../components/features/LegalMarkdown/LegalMarkdown";

export const metadata: Metadata = {
  title: "Privacy Policy — MergeSignal",
  description:
    "How MergeSignal collects, uses, and protects data, including Customer Content restrictions.",
};

export default function PrivacyPage() {
  return <LegalMarkdown doc="privacy" />;
}
