"use client";

import { useEffect } from "react";

export function HashAnchorSync() {
  useEffect(() => {
    let cancelled = false;

    const jumpToHash = () => {
      if (cancelled || !window.location.hash) return;
      const id = decodeURIComponent(window.location.hash.slice(1));
      const target = document.getElementById(id);
      if (!target) return;

      const root = document.documentElement;
      const previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      target.scrollIntoView({ block: "start" });
      root.style.scrollBehavior = previousBehavior;
    };

    const scheduleJump = () => requestAnimationFrame(() => requestAnimationFrame(jumpToHash));
    scheduleJump();
    const layoutTimer = window.setTimeout(scheduleJump, 300);
    document.fonts?.ready.then(scheduleJump);
    window.addEventListener("hashchange", scheduleJump);

    return () => {
      cancelled = true;
      window.clearTimeout(layoutTimer);
      window.removeEventListener("hashchange", scheduleJump);
    };
  }, []);

  return null;
}
