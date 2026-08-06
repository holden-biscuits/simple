import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the event directory", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Event Basecamp · 2026<\/title>/i);
  assert.match(html, /Know the route before you hit the floor\./);
  assert.match(html, /TeamSimple attendance/);
  assert.match(html, /Genesys Xperience/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Building your site/i);
});

test("server-renders the source monitor and approval queue", async () => {
  const response = await render("/sources");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Source monitor/);
  assert.match(html, /Monday, Wednesday and Friday/);
  assert.match(html, /Conference tracker/);
  assert.match(html, /HubSpot/);
  assert.match(html, /Granola/);
  assert.match(html, /Approval queue/);
  assert.match(html, /Customer Connect Expo/);
  assert.match(html, /ICMI/i);
});

test("server-renders dynamic event facts without empty filler notes", async () => {
  const genesys = await render("/events/genesys-xperience");
  assert.equal(genesys.status, 200);
  const genesysHtml = await genesys.text();
  assert.match(genesysHtml, /No guaranteed meetings/);
  assert.match(genesysHtml, /Do these next/);
  assert.match(genesysHtml, /Wish Line/);

  const orlando = await render("/events/ccw-orlando");
  assert.equal(orlando.status, 200);
  const orlandoHtml = await orlando.text();
  assert.doesNotMatch(orlandoHtml, /Past event\. Booth presence is recorded/);
});
