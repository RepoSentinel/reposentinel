import { SiteChrome } from "../components/shared/layout/SiteChrome/SiteChrome";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteChrome
      title="MergeSignal"
      hideTitlebar
      hideHeaderNav
      footerVariant="minimal"
      mainWidth="default"
    >
      {children}
    </SiteChrome>
  );
}
