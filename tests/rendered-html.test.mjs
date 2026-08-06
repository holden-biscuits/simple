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
  assert.doesNotMatch(html, /Resolve these before more work starts\./);
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
  assert.match(html, /No unresolved source conflicts are recorded\./);
  assert.match(html, /Latest applied checks/);
  assert.match(html, /29 of 29 matching records reviewed/);
});

test("server-renders searchable event outcomes and filter counts", async () => {
  const response = await render("/search");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Find the detail, not the page\./);
  assert.match(html, /16 meetings · 7 demos recorded/);
  assert.match(html, /<span>All<\/span><b>\d+<\/b>/);
});

test("server-renders dynamic event facts without empty filler notes", async () => {
  const genesys = await render("/events/genesys-xperience");
  assert.equal(genesys.status, 200);
  const genesysHtml = await genesys.text();
  assert.match(genesysHtml, /No guaranteed meetings/);
  assert.match(genesysHtml, /Do these next/);
  assert.match(genesysHtml, /Wish Line/);

  const contact = await render("/events/contact-io");
  assert.equal(contact.status, 200);
  const contactHtml = await contact.text();
  assert.match(contactHtml, /Not attending/);
  assert.match(contactHtml, /No activation planned/);
  assert.match(contactHtml, /Nothing to prep for this event\./);
  assert.match(contactHtml, /No team assigned/);
  assert.doesNotMatch(contactHtml, /What needs to happen\./);
  assert.doesNotMatch(contactHtml, /Who’s going/);

  const customerConnect = await render("/events/customer-connect-expo");
  assert.equal(customerConnect.status, 200);
  const customerConnectHtml = await customerConnect.text();
  assert.match(customerConnectHtml, /Confirmed/);
  assert.match(customerConnectHtml, /Four attendees and a 10×10 booth are planned/);

  const icmi = await render("/events/icmi-contact-center-expo");
  assert.equal(icmi.status, 200);
  const icmiHtml = await icmi.text();
  assert.match(icmiHtml, /Confirmed/);
  assert.match(icmiHtml, /TeamSimple is attending/);

  const orlando = await render("/events/ccw-orlando");
  assert.equal(orlando.status, 200);
  const orlandoHtml = await orlando.text();
  assert.doesNotMatch(orlandoHtml, /Past event\. Booth presence is recorded/);

  const vegas = await render("/events/ccw-vegas");
  assert.equal(vegas.status, 200);
  const vegasHtml = await vegas.text();
  assert.match(vegasHtml, /crm-snapshot/);
  assert.match(vegasHtml, /HubSpot/);
  assert.match(vegasHtml, /explicitly attributed deals/);
  assert.match(vegasHtml, /Demo completed/);
  assert.match(vegasHtml, /All 29 attributed deals currently have \$0 amount/);
});
