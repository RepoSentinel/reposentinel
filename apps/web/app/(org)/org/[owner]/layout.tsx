import { SiteChrome } from "../../../components/shared/layout/SiteChrome/SiteChrome";

export default async function OrgOwnerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ owner: string }>;
}) {
  const { owner } = await params;
  return (
    <SiteChrome
      title="MergeSignal"
      hideTitlebar
      owner={owner}
      footerVariant="full"
      mainWidth="default"
    >
      {children}
    </SiteChrome>
  );
}
