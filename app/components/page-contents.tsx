import type { ReactNode } from "react";
import { PageContentsLinks, type PageContentsGroup } from "./page-contents-links";

export type PageContentsItem = { id: string; label: string };

export function PageContents({
  items = [],
  secondaryItems = [],
  secondaryLabel = "More sections",
  primaryLabel = "Page sections",
  mobileLabel = "Navigate this page",
  variant = "bar",
  groups,
}: {
  items?: PageContentsItem[];
  secondaryItems?: PageContentsItem[];
  secondaryLabel?: string;
  primaryLabel?: string;
  mobileLabel?: string;
  variant?: "bar" | "side";
  groups?: PageContentsGroup[];
}) {
  if (variant === "side") {
    const contentsGroups: PageContentsGroup[] = groups?.length ? groups : [
      { label: primaryLabel, items },
      ...(secondaryItems.length ? [{ label: secondaryLabel, items: secondaryItems }] : []),
    ];
    const itemCount = contentsGroups.reduce((total, group) => total + group.items.length, 0);

    return (
      <aside className="page-contents-side">
        <PageContentsLinks groups={contentsGroups} showHeading />
        <details className="page-contents-mobile">
          <summary>{mobileLabel} <span>{itemCount}</span></summary>
          <PageContentsLinks groups={contentsGroups} />
        </details>
      </aside>
    );
  }

  return (
    <nav className="page-contents shell" aria-label="On this page">
      <strong>On this page</strong>
      <div className="page-contents-links">
        {items.map((item) => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}
      </div>
    </nav>
  );
}

export function PageContentsLayout({
  items,
  secondaryItems,
  secondaryLabel,
  primaryLabel,
  mobileLabel,
  groups,
  children,
}: {
  items?: PageContentsItem[];
  secondaryItems?: PageContentsItem[];
  secondaryLabel?: string;
  primaryLabel?: string;
  mobileLabel?: string;
  groups?: PageContentsGroup[];
  children: ReactNode;
}) {
  return (
    <div className="page-with-contents shell">
      <PageContents
        variant="side"
        items={items}
        secondaryItems={secondaryItems}
        secondaryLabel={secondaryLabel}
        primaryLabel={primaryLabel}
        mobileLabel={mobileLabel}
        groups={groups}
      />
      <div className="page-with-contents-main">{children}</div>
    </div>
  );
}

export function BackToTop() {
  return <a className="back-to-top" href="#page-top">Back to top <span aria-hidden="true">↑</span></a>;
}
