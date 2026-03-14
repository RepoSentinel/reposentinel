import ScanClient from "./ScanClient";
import { AppShell } from "../../_components/AppShell";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell title="Scan" subtitle={id}>
      <ScanClient id={id} />
    </AppShell>
  );
}
