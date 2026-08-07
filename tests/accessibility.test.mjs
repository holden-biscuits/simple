import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { events } from "../app/data/events.ts";

const routes = ["/", "/guides", "/ae", "/sdr", "/marketing", "/leadership", "/search", "/sources", ...events.map((event) => `/events/${event.slug}`)];

async function render(path) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("accessibility-test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  return { status: response.status, html: await response.text() };
}

test("every page offers a working keyboard skip link and one primary heading", async () => {
  for (const route of routes) {
    const { status, html } = await render(route);
    assert.equal(status, 200, `${route} should render`);
    assert.match(html, /class="skip-link" href="#main-content">Skip to content<\/a>/, `${route} should expose the skip link`);
    assert.match(html, /id="main-content"[^>]*tabindex="-1"/, `${route} should expose the skip target`);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${route} should have exactly one h1`);
    assert.equal((html.match(/<main\b/g) ?? []).length, 1, `${route} should have exactly one main landmark`);
  }
});

test("search preserves user focus and announces result-count changes", async () => {
  const { html } = await render("/search");
  assert.doesNotMatch(html, /<input[^>]*autofocus/i);
  assert.match(html, /class="search-result-heading" aria-live="polite" aria-atomic="true"/);
});

test("focus indicators and reduced-motion fallbacks cover every interactive control", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /:where\(a, button, input, select, summary, \[tabindex\]\):focus-visible/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\*::before, \*::after/);
  assert.match(css, /animation-duration:\s*\.01ms !important/);
});
