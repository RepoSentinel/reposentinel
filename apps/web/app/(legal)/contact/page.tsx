import type { Metadata } from "next";

import { LegalMarkdown } from "../../components/features/LegalMarkdown/LegalMarkdown";

export const metadata: Metadata = {
  title: "Contact — MergeSignal",
  description:
    "Contact MergeSignal for legal, security, support, and business inquiries.",
};

export default function ContactPage() {
  return <LegalMarkdown doc="contact" />;
}
