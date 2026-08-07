import test from "node:test";
import assert from "node:assert/strict";
import { events } from "../app/data/events.ts";

const staticRoutes = ["/", "/guides", "/ae", "/sdr", "/marketing", "/leadership", "/search", "/sources"];
const eventRoutes = events.map((event) => `/events/${event.slug}`);
const knownRoutes = new Set([...staticRoutes, ...eventRoutes]);
const rendered = new Map();

async function render(path) {
  if (rendered.has(path)) return rendered.get(path);
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("link-test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const result = { status: response.status, html: await response.text() };
  rendered.set(path, result);
  return result;
}

function attributes(html, name) {
  return [...html.matchAll(new RegExp(`\\b${name}="([^"]*)"`, "g"))].map((match) => match[1].replaceAll("&amp;", "&"));
}

function anchorHrefs(html) {
  return [...html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)].map((match) => match[1].replaceAll("&amp;", "&"));
}

test("every rendered internal link resolves to a route and every hash resolves to an anchor", async () => {
  for (const sourceRoute of knownRoutes) {
    const source = await render(sourceRoute);
    assert.equal(source.status, 200, `${sourceRoute} should render`);

    for (const href of anchorHrefs(source.html)) {
      if (!href || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
      assert.notEqual(href, "#", `${sourceRoute} contains a dead hash link`);

      const target = new URL(href, `http://localhost${sourceRoute}`);
      assert.ok(knownRoutes.has(target.pathname), `${sourceRoute} links to unknown route ${target.pathname}`);

      if (target.hash) {
        const targetPage = await render(target.pathname);
        const targetIds = new Set(attributes(targetPage.html, "id"));
        const anchor = decodeURIComponent(target.hash.slice(1));
        assert.ok(targetIds.has(anchor), `${sourceRoute} links to missing anchor ${target.pathname}#${anchor}`);
      }
    }
  }
});

test("every event URL is canonical and unique", () => {
  assert.equal(eventRoutes.length, new Set(eventRoutes).size);
  for (const route of eventRoutes) assert.match(route, /^\/events\/[a-z0-9]+(?:-[a-z0-9]+)*$/);
});
