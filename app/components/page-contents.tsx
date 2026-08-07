export type PageContentsItem = { id: string; label: string };

export function PageContents({
  items,
  secondaryItems = [],
  secondaryLabel = "More sections",
  variant = "bar",
}: {
  items: PageContentsItem[];
  secondaryItems?: PageContentsItem[];
  secondaryLabel?: string;
  variant?: "bar" | "side";
}) {
  if (variant === "side") {
    const contentsGroups = [
      { label: "Event brief", items },
      ...(secondaryItems.length ? [{ label: secondaryLabel, items: secondaryItems }] : []),
    ];

    return (
      <aside className="page-contents-side">
        <nav aria-label="On this page">
          <strong>Navigate</strong>
          {contentsGroups.map((group) => <section key={group.label}>
            <b>{group.label}</b>
            {group.items.map((item) => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}
          </section>)}
        </nav>
        <details className="page-contents-mobile">
          <summary>Navigate this event <span>{items.length + secondaryItems.length}</span></summary>
          <nav aria-label="On this page">
            {contentsGroups.map((group) => <section key={group.label}>
              <b>{group.label}</b>
              {group.items.map((item) => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}
            </section>)}
          </nav>
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

export function BackToTop() {
  return <a className="back-to-top" href="#page-top">Back to top <span aria-hidden="true">↑</span></a>;
}
