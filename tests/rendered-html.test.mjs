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
  assert.match(html, /CCW Exchange Chicago/);
  assert.match(html, /tracker names Taylor and marks Josh available/);
  assert.match(html, /IQPC CX Travel &amp; Hospitality/);
  assert.match(html, /calendar record lists Zach \+ Taylor/);
  assert.match(html, /Latest applied checks/);
  assert.match(html, /29 of 29 matching records reviewed/);
  assert.match(html, /Google Sheets/);
  assert.match(html, /27 event rows reviewed/);
  assert.match(html, /Genesys Xperience focused scan/);
  assert.match(html, /booking the send still needs approval/);
  assert.match(html, /CCW Exchange Chicago focused scan/);
  assert.match(html, /28 researched accounts/);
  assert.match(html, /IQPC CX Travel &amp; Hospitality focused scan/);
  assert.match(html, /invitation-only format/);
  assert.match(html, /Customer Connect Expo focused scan/);
  assert.match(html, /25%-complete company profile/);
});

test("server-renders searchable event outcomes and filter counts", async () => {
  const response = await render("/search");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Find the detail, not the page\./);
  assert.match(html, /16 meetings · 7 demos recorded/);
  assert.match(html, /<span>All<\/span><b>\d+<\/b>/);
  assert.match(html, /Holden/);
});

test("server-renders a searchable marketing support board", async () => {
  const response = await render("/marketing");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /See the work and the gaps in one place\./);
  assert.match(html, /Find an event or task/);
  assert.match(html, /Support listed/);
  assert.match(html, /No support listed/);
  assert.match(html, /Team unassigned/);
  assert.match(html, /Most urgent open item/);
  assert.match(html, /Cat, Holden, Matt, Taylor, Josh, Carter, Deepti, Richard, Lars/);
  assert.doesNotMatch(html, /Confirm the next owner and deadline/);
});

test("server-renders dynamic event facts without empty filler notes", async () => {
  const genesys = await render("/events/genesys-xperience");
  assert.equal(genesys.status, 200);
  const genesysHtml = await genesys.text();
  assert.match(genesysHtml, /No guaranteed meetings/);
  assert.match(genesysHtml, /Do these next/);
  assert.match(genesysHtml, /Wish Line/);
  assert.match(genesysHtml, /Cat, Holden, Matt, Taylor, Josh, Carter, Deepti, Richard, Lars/);
  assert.match(genesysHtml, /Available<\/dt><dd>None listed/);
  assert.doesNotMatch(genesysHtml, /Final roster still needs to be reconciled/);
  assert.match(genesysHtml, /Contracted pre-event email add-on/);
  assert.match(genesysHtml, /sponsor portal by Aug 13/);
  assert.match(genesysHtml, /flights, hotel blocks, and passes are marked complete in Notion/);

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
  assert.match(customerConnectHtml, /executed exhibition-space contract/);
  assert.match(customerConnectHtml, /Aug 10 at 9:00 AM PT/);
  assert.match(customerConnectHtml, /25% complete on Aug 6/);
  assert.match(customerConnectHtml, /Exhibitor portal/);

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

  const lead = await render("/events/the-lead-summit");
  const leadHtml = await lead.text();
  assert.match(leadHtml, /Taylor, Josh/);
  assert.doesNotMatch(leadHtml, /Matt, Josh/);

  const denver = await render("/events/ccw-exchange-denver");
  const denverHtml = await denver.text();
  assert.match(denverHtml, /Matt, Carter/);

  const chicago = await render("/events/ccw-exchange-chicago");
  const chicagoHtml = await chicago.text();
  assert.match(chicagoHtml, /Taylor is the confirmed attendee/);
  assert.match(chicagoHtml, /Carter and Josh are marked available/);
  assert.match(chicagoHtml, /Source check needed/);
  assert.match(chicagoHtml, /internal 28-account ICP sheet/);
  assert.match(chicagoHtml, /9 priority-1, 9 priority-2, 9 priority-3, and 1 unranked/);

  const shoptalkFall = await render("/events/shoptalk-fall");
  const shoptalkFallHtml = await shoptalkFall.text();
  assert.match(shoptalkFallHtml, /Sep 29–30, 2026/);
  assert.match(shoptalkFallHtml, /Not attending/);
  assert.doesNotMatch(shoptalkFallHtml, /4 planned/);

  const travel = await render("/events/iqpc-cx-travel-hospitality");
  const travelHtml = await travel.text();
  assert.match(travelHtml, /Source check needed/);
  assert.match(travelHtml, /Hilton London Syon Park/);
  assert.match(travelHtml, /invitation-only Exchange/);
  assert.match(travelHtml, /connected guest journeys/);
  assert.match(travelHtml, /calendar record lists Zach \+ Taylor/);
});
