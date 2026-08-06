import Link from "next/link";
import { SiteHeader } from "./site-header";
import { Footer } from "./footer";

export type RoleSection = { label: string; title: string; items: string[] };

export function RolePage({ code, title, intro, sections, handoff }: { code: string; title: string; intro: string; sections: RoleSection[]; handoff: string }) {
  return (
    <main>
      <SiteHeader />
      <section className="role-hero">
        <p className="eyebrow">Crew guide · {code}</p>
        <h1>{title}</h1>
        <p className="lede">{intro}</p>
        <Link className="button" href="/">Check the event map <span>↗</span></Link>
      </section>
      <section className="role-grid shell">
        {sections.map((section, index) => (
          <article className="role-block" key={section.title}>
            <div className="role-number">{String(index + 1).padStart(2, "0")}</div>
            <div>
              <p className="eyebrow">{section.label}</p>
              <h2>{section.title}</h2>
              <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </article>
        ))}
      </section>
      <section className="handoff shell">
        <p className="eyebrow">Before you pack up</p>
        <h2>{handoff}</h2>
      </section>
      <Footer />
    </main>
  );
}
