import type { Metadata } from "next";

import { AnchorSideNav } from "../components/shared/AnchorSideNav/AnchorSideNav";
import { SiteChrome } from "../components/shared/layout/SiteChrome/SiteChrome";
import { gettingStartedAnchorItems } from "./gettingStartedAnchors";
import layoutStyles from "./GettingStartedLayout.module.css";

export const metadata: Metadata = {
  title: "Getting started",
  description:
    "Spot dependency risk before merge: quick local scan, then GitHub Actions summary on every PR-no server required.",
  alternates: { canonical: "/getting-started" },
};

export default function GettingStartedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteChrome
      title="Getting started"
      hideTitlebar
      footerVariant="full"
      mainWidth="wide"
    >
      <div className={layoutStyles.layout}>
        <div className={layoutStyles.navRail}>
          <div className={layoutStyles.navRailSticky}>
            <AnchorSideNav
              items={gettingStartedAnchorItems}
              ariaLabel="Getting started sections"
            />
          </div>
        </div>
        <div className={layoutStyles.main}>{children}</div>
      </div>
    </SiteChrome>
  );
}
