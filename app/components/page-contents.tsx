export type PageContentsItem = { id: string; label: string };

export function PageContents({ items }: { items: PageContentsItem[] }) {
  return (
    <nav className="page-contents shell" aria-label="On this page">
      <strong>On this page</strong>
      <div>
        {items.map((item) => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}
      </div>
    </nav>
  );
}

export function BackToTop() {
  return <a className="back-to-top" href="#page-top">Back to top <span aria-hidden="true">↑</span></a>;
}
