import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "./site-header";
import { Footer } from "./footer";
import { BackToTop, PageContents } from "./page-contents";

export type RoleSection = { label: string; title: string; items: ReactNode[] };

function sectionId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function RolePage({ code, title, intro, sections, handoff }: { code: string; title: string; intro: string; sections: RoleSection[]; handoff: string }) {
  const contents = sections.map((section) => ({ id: sectionId(section.title), label: section.title }));
  return (
    <main id="page-top">
      <SiteHeader />
      <section className="role-hero">
        <p className="eyebrow">Crew guide · {code}</p>
        <h1>{title}</h1>
        <p className="lede">{intro}</p>
        <Link className="button" href="/">Check the event map <span>↗</span></Link>
      </section>
      <PageContents items={[...contents, { id: "event-close", label: "Before you close" }]} />
      <section className="role-grid shell">
        {sections.map((section, index) => (
          <article className="role-block" id={sectionId(section.title)} key={section.title}>
            <div className="role-number">{String(index + 1).padStart(2, "0")}</div>
            <div>
              <p className="eyebrow">{section.label}</p>
              <h2>{section.title}</h2>
              <ul>{section.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul>
              <BackToTop />
            </div>
          </article>
        ))}
      </section>
      <section className="handoff shell" id="event-close">
        <p className="eyebrow">Before you close the event</p>
        <h2>{handoff}</h2>
        <BackToTop />
      </section>
      <Footer />
    </main>
  );
}
