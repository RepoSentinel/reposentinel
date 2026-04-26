import type { Metadata } from "next";

import { LegalMarkdown } from "../_components/LegalMarkdown";

export const metadata: Metadata = {
  title: "Terms of Service — MergeSignal",
  description:
    "MergeSignal Terms of Service: acceptable use, API rules, limitations, and liability.",
};

export default function TermsPage() {
  return <LegalMarkdown doc="terms" />;
}
