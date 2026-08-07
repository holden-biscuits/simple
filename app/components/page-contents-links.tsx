"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";

export type PageContentsLink = { id: string; label: string };
export type PageContentsGroup = { label: string; items: PageContentsLink[] };

export function PageContentsLinks({ groups, showHeading = false }: { groups: PageContentsGroup[]; showHeading?: boolean }) {
  const ids = useMemo(() => groups.flatMap((group) => group.items.map((item) => item.id)), [groups]);
  const [activeId, setActiveId] = useState(ids[0] ?? "");

  useEffect(() => {
    let frame = 0;

    const updateActiveSection = () => {
      frame = 0;
      const anchorOffset = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--anchor-offset")) || 0;
      const threshold = anchorOffset + 24;
      let nextId = ids[0] ?? "";

      for (const id of ids) {
        const target = document.getElementById(id);
        if (!target) continue;
        if (target.getBoundingClientRect().top <= threshold) nextId = id;
        else break;
      }

      if (window.location.hash) {
        const hashId = decodeURIComponent(window.location.hash.slice(1));
        const hashTarget = document.getElementById(hashId);
        if (hashTarget && ids.includes(hashId) && Math.abs(hashTarget.getBoundingClientRect().top - anchorOffset) < 80) nextId = hashId;
      }

      setActiveId(nextId);
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveSection);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
    };
  }, [ids]);

  const closeMobileMenu = (event: MouseEvent<HTMLAnchorElement>) => {
    const details = event.currentTarget.closest("details");
    if (details) window.requestAnimationFrame(() => { details.open = false; });
  };

  return (
    <nav aria-label="On this page">
      {showHeading ? <strong>Navigate</strong> : null}
      {groups.map((group) => <section key={group.label}>
        <b>{group.label}</b>
        {group.items.map((item) => <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={activeId === item.id ? "location" : undefined}
          onClick={closeMobileMenu}
        >{item.label}</a>)}
      </section>)}
    </nav>
  );
}
