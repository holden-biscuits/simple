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
  assert.match(html, /<title>Event Basecamp · 2026–2027<\/title>/i);
  assert.match(html, /aria-label="TeamSimple Event Basecamp home"/);
  assert.match(html, /TeamSimple/);
  assert.match(html, /Know the route before you hit the floor\./);
  assert.match(html, /surfaces the workstreams in play/);
  assert.doesNotMatch(html, /page says “None/);
  assert.match(html, /ranger-raccoon-clean-hat\.png/);
  assert.match(html, /class="ranger-hat-logo"/);
  assert.doesNotMatch(html, /ranger-raccoon-v2/);
  assert.match(html, /TeamSimple attendance/);
  assert.match(html, /Program year/);
  assert.match(html, /<span>All years<\/span><b>29<\/b>/);
  assert.match(html, /<span>2026<\/span><b>26<\/b>/);
  assert.match(html, /<span>2027<\/span><b>3<\/b>/);
  assert.match(html, /Genesys Xperience/);
  assert.match(html, /CCW Orlando 2027/);
  assert.match(html, /CCW UK Executive Exchange 2027/);
  assert.match(html, /CCW Vegas 2027/);
  assert.match(html, /29(?:<!-- -->)?<\/strong><span>events on the map/);
  assert.match(html, /Checked <time dateTime="2026-08-06">Aug 6<\/time>/);
  assert.match(html, /Conference tracker \+ 4/);
  assert.match(html, /CCW Orlando[\s\S]*2(?:<!-- -->)? Attending/);
  assert.match(html, /Guaranteed Meetings · Count TBD/);
  assert.doesNotMatch(html, /Resolve these before more work starts\./);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Building your site/i);
});

test("server-renders the source monitor and approval queue", async () => {
  const response = await render("/sources");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Source monitor/);
  assert.match(html, /What changed, and why\./);
  assert.match(html, /<span>Applied<\/span><strong>4<\/strong>/);
  assert.match(html, /<span>Needs review<\/span><strong>3<\/strong>/);
  assert.match(html, /<span>No change<\/span><strong>2<\/strong>/);
  assert.match(html, /Added the 2027 event program/);
  assert.match(html, /26 events · 2026 only/);
  assert.match(html, /29 events · 2026–2027/);
  assert.match(html, /Monday, Wednesday and Friday/);
  assert.match(html, /Conference tracker/);
  assert.match(html, /30 event rows checked · 2026 \+ 2027 · Aug 6/);
  assert.match(html, /2 organizer updates applied · Aug 6/);
  assert.match(html, /29 attributed deals · all CCW Vegas · Aug 6/);
  assert.match(html, /No direct scan available/);
  assert.match(html, /HubSpot/);
  assert.match(html, /Granola/);
  assert.doesNotMatch(html, /first run pending/);
  assert.match(html, /Last completed scan: Aug 06, 2026 · 6:26 PM PT · manual baseline/);
  assert.match(html, /First end-to-end source baseline/);
  assert.match(html, /all explicitly attributed to CCW Vegas/);
  assert.match(html, /Approval queue/);
  assert.match(html, /CCW Exchange Chicago/);
  assert.match(html, /tracker names Taylor and marks Josh available/);
  assert.match(html, /IQPC CX Travel &amp; Hospitality/);
  assert.match(html, /calendar record lists Zach \+ Taylor/);
  assert.match(html, /Latest applied checks/);
  assert.match(html, /29 of 29 matching records reviewed/);
  assert.match(html, /Google Sheets/);
  assert.match(html, /27 event rows reviewed/);
  assert.match(html, /Genesys Xperience field brief and CRM check/);
  assert.match(html, /Wish Line media buy is approved/);
  assert.match(html, /no Genesys-attributed deal/);
  assert.match(html, /CCW Exchange Chicago focused scan/);
  assert.match(html, /28 researched accounts/);
  assert.match(html, /IQPC CX Travel &amp; Hospitality focused scan/);
  assert.match(html, /invitation-only format/);
  assert.match(html, /Customer Connect Expo focused scan/);
  assert.match(html, /25%-complete company profile/);
  assert.match(html, /2027 conference tracker/);
  assert.match(html, /Three confirmed 2027 events were added/);
  assert.match(html, /“Mon Jun 15” workshop label conflicts/);
});

test("server-renders searchable event outcomes and filter counts", async () => {
  const response = await render("/search?q=names%20open&type=Event");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Find the detail, not the page\./);
  assert.match(html, /value="names open"/);
  assert.match(html, /Results open the exact event brief or marketing workspace you need/);
  assert.match(html, /Useful starting points/);
  assert.match(html, /Staffing · names open/);
  assert.match(html, /Meeting package · count TBD/);
  assert.match(html, /16 meetings · 7 demos recorded/);
  assert.match(html, /<span>All<\/span><b>\d+<\/b>/);
  assert.match(html, /Holden/);

  const sourceSearch = await render("/search?q=Restricted%20Genesys%20brief&type=Event");
  assert.equal(sourceSearch.status, 200);
  const sourceSearchHtml = await sourceSearch.text();
  assert.match(sourceSearchHtml, /Genesys Xperience/);
  assert.match(sourceSearchHtml, /Source check · Aug 6, 2026 · Direct update · Notion · Gmail · HubSpot · Restricted Genesys brief/);
});

test("server-renders a searchable marketing support board", async () => {
  const response = await render("/marketing?event=genesys-xperience");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /See the work and the gaps in one place\./);
  assert.match(html, /Find an event or task/);
  assert.match(html, /Support listed/);
  assert.match(html, /No support listed/);
  assert.match(html, /Team unassigned/);
  assert.match(html, /Next open item/);
  assert.doesNotMatch(html, /Most urgent open item/);
  assert.match(html, /Cat, Holden, Matt, Taylor, Josh, Carter, Deepti, Richard, Lars/);
  assert.match(html, /Keep each event’s execution list in its own tab/);
  assert.match(html, /Genesys Xperience/);
  assert.match(html, /Submit the contracted pre-event email copy/);
  assert.match(html, /Produce the booth-monitor product video/);
  assert.ok(html.indexOf("Deliver the final solution-talk deck") < html.indexOf("Submit the contracted pre-event email copy"));
  assert.match(html, /HubSpot form, campaign attribution, and 15-minute demo CTA are already live/);
  assert.match(html, /aria-selected="true"[^>]*id="event-task-tab-genesys-xperience"/);
  assert.match(html, /id="event-task-tab-genesys-xperience"[^>]*tabindex="0"/);
  assert.doesNotMatch(html, /Confirm the next owner and deadline/);

  const customerConnect = await render("/marketing?event=customer-connect-expo");
  assert.equal(customerConnect.status, 200);
  const customerConnectHtml = await customerConnect.text();
  assert.ok(customerConnectHtml.indexOf("Confirm invoice payment status with AP") < customerConnectHtml.indexOf("Use the organizer onboarding call"));
  assert.match(customerConnectHtml, /Due today/);
  assert.match(customerConnectHtml, /Reconcile portal deadlines and booth assets/);
  assert.match(customerConnectHtml, /Complete the exhibitor company profile/);
  assert.match(customerConnectHtml, /Aug 17/);
});

test("search routes marketing tasks to the selected event workspace", async () => {
  const response = await render("/search?q=booth-monitor%20product%20video&type=Operations");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Genesys Xperience · Produce the booth-monitor product video/);
  assert.match(html, /\/marketing\?event=genesys-xperience#event-tasks/);
  assert.match(html, /Results open the exact event brief or marketing workspace you need/);

  const eventAction = await render("/search?q=Lunch%20%26%20Learn%20contracted&type=Operations");
  assert.equal(eventAction.status, 200);
  const eventActionHtml = await eventAction.text();
  assert.match(eventActionHtml, /ICMI Contact Center Expo · Confirm whether the Wednesday Lunch &amp; Learn is contracted/);
  assert.match(eventActionHtml, /\/events\/icmi-contact-center-expo#event-priorities/);
});

test("server-renders field-role CRM rules and the updated guide model", async () => {
  const sdr = await render("/sdr");
  assert.equal(sdr.status, 200);
  const sdrHtml = await sdr.text();
  assert.match(sdrHtml, /role-hero-sdr/);
  assert.match(sdrHtml, /Turn event conversations into qualified meetings\./);
  assert.match(sdrHtml, /How to work the event/);
  assert.match(sdrHtml, /Protect the AEs’ time/);
  assert.match(sdrHtml, /keeping the booth from going quiet/);
  assert.match(sdrHtml, /A paid SDR ticket is for working the floor/);
  assert.match(sdrHtml, /Events with alcohol are still work/);
  assert.match(sdrHtml, /Treat the trip as a privilege, not a vacation/);
  assert.match(sdrHtml, /add every booked meeting to/);
  assert.match(sdrHtml, /event source, current setup, call volume, qualification outcome, owner, agreed next action, and meeting logistics/);
  assert.match(sdrHtml, /https:\/\/app\.hubspot\.com/);

  const guides = await render("/guides");
  assert.equal(guides.status, 200);
  const guidesHtml = await guides.text();
  assert.match(guidesHtml, /Empty sections stay out of the way/);
  assert.match(guidesHtml, /marketing production and budget work live in the event tabs/);
  assert.doesNotMatch(guidesHtml, /If the team is not doing something, the page says/);
});

test("server-renders dynamic event facts without empty filler notes", async () => {
  const genesys = await render("/events/genesys-xperience");
  assert.equal(genesys.status, 200);
  const genesysHtml = await genesys.text();
  assert.match(genesysHtml, /No guaranteed meetings/);
  assert.match(genesysHtml, /Checked <time dateTime="2026-08-06">Aug 6, 2026<\/time>/);
  assert.match(genesysHtml, /Direct update · Notion · Gmail · HubSpot · Restricted Genesys brief/);
  assert.match(genesysHtml, /href="\/sources">See source record/);
  assert.match(genesysHtml, /Guaranteed meetings<\/span><strong>None/);
  assert.doesNotMatch(genesysHtml, /Meetings scheduled/);
  assert.match(genesysHtml, /Team<\/span><strong>9 attending/);
  assert.doesNotMatch(genesysHtml, /Do these next/);
  assert.match(genesysHtml, /id="event-priorities"/);
  assert.match(genesysHtml, /Still needs attention\./);
  assert.match(genesysHtml, /6(?:<!-- -->)? event-specific/);
  assert.match(genesysHtml, /items are(?:<!-- -->)? still open in the current plan/);
  assert.match(genesysHtml, /Deliver Cat’s final solution-talk deck by Aug 10/);
  assert.match(genesysHtml, /href="\/marketing\?event=genesys-xperience#event-tasks"/);
  assert.match(genesysHtml, /Wish Line/);
  for (const person of ["Cat", "Holden", "Matt", "Taylor", "Josh", "Carter", "Deepti", "Richard", "Lars"]) assert.match(genesysHtml, new RegExp(`>${person}<`));
  assert.doesNotMatch(genesysHtml, />Available</);
  assert.doesNotMatch(genesysHtml, /Final roster still needs to be reconciled/);
  assert.match(genesysHtml, /only external voice-AI partner in the current sponsor plan/);
  assert.match(genesysHtml, /Download the Cvent Events app now/);
  assert.match(genesysHtml, /Stanleys/);
  assert.match(genesysHtml, /Karaoke machines/);
  assert.match(genesysHtml, /Genesys sales rules \(confidential\)/);
  assert.match(genesysHtml, /Genesys trademark usage policy/);
  assert.match(genesysHtml, /Lead Registration Form/);
  assert.match(genesysHtml, /permission to share the contact’s information/);
  assert.match(genesysHtml, /no response within 10 business days means it was rejected/);
  assert.match(genesysHtml, /Do not pursue or register federal, state, local, or foreign government entities/);
  assert.match(genesysHtml, /Do not promise Genesys pricing, terms, product commitments, or approval/);
  assert.match(genesysHtml, /Aug 13/);
  assert.match(genesysHtml, /Travel and hotels should already be booked/);
  assert.match(genesysHtml, /Marketing tasks/);
  assert.doesNotMatch(genesysHtml, /id="workstream-marketing"/);
  assert.doesNotMatch(genesysHtml, /id="workstream-budget"/);
  assert.doesNotMatch(genesysHtml, /id="workstream-secondary"/);

  const contact = await render("/events/contact-io");
  assert.equal(contact.status, 200);
  const contactHtml = await contact.text();
  assert.match(contactHtml, /Not attending/);
  assert.match(contactHtml, /No activation planned/);
  assert.match(contactHtml, /Nothing to prep for this event\./);
  assert.match(contactHtml, /No team assigned/);
  assert.doesNotMatch(contactHtml, /id="event-priorities"/);
  assert.doesNotMatch(contactHtml, /What needs to happen\./);
  assert.doesNotMatch(contactHtml, /Who’s going/);

  const trackerBaselineEvent = await render("/events/ccw-orlando");
  assert.equal(trackerBaselineEvent.status, 200);
  const trackerBaselineHtml = await trackerBaselineEvent.text();
  assert.match(trackerBaselineHtml, /Checked <time dateTime="2026-08-06">Aug 6, 2026<\/time>/);
  assert.match(trackerBaselineHtml, /<p>Conference tracker<\/p>/);

  const customerConnect = await render("/events/customer-connect-expo");
  assert.equal(customerConnect.status, 200);
  const customerConnectHtml = await customerConnect.text();
  assert.match(customerConnectHtml, /Confirmed/);
  assert.match(customerConnectHtml, /Four attendees and a 10×10 booth are planned/);
  assert.match(customerConnectHtml, /executed exhibition-space contract/);
  assert.match(customerConnectHtml, /Aug 10 at 9:00 AM PT/);
  assert.match(customerConnectHtml, /25% complete on Aug 6/);
  assert.match(customerConnectHtml, /Exhibitor portal/);
  assert.match(customerConnectHtml, /Complimentary tickets/);
  assert.doesNotMatch(customerConnectHtml, /id="workstream-swag"/);

  const icmi = await render("/events/icmi-contact-center-expo");
  assert.equal(icmi.status, 200);
  const icmiHtml = await icmi.text();
  assert.match(icmiHtml, /TeamSimple is attending/);

  const orlando = await render("/events/ccw-orlando");
  assert.equal(orlando.status, 200);
  const orlandoHtml = await orlando.text();
  assert.doesNotMatch(orlandoHtml, /Past event\. Booth presence is recorded/);
  assert.doesNotMatch(orlandoHtml, /id="event-priorities"/);

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

  const orlando2027 = await render("/events/ccw-orlando-2027");
  assert.equal(orlando2027.status, 200);
  const orlando2027Html = await orlando2027.text();
  assert.match(orlando2027Html, /Jan 25–27, 2027/);
  assert.match(orlando2027Html, /11 planned · names open/);
  assert.match(orlando2027Html, /6 Executive Leadership Exchange meetings/);
  assert.match(orlando2027Html, /JW Marriott Bonnet Creek/);
  assert.match(orlando2027Html, /2027 conference tracker · Organizer site/);

  const uk2027 = await render("/events/ccw-uk-executive-exchange-2027");
  assert.equal(uk2027.status, 200);
  const uk2027Html = await uk2027.text();
  assert.match(uk2027Html, /March 2027 · exact dates TBD/);
  assert.match(uk2027Html, /minimum 10 30-minute meetings/);
  assert.match(uk2027Html, /3 sponsor passes · 2 attendees planned/);

  const vegas2027 = await render("/events/ccw-vegas-2027");
  assert.equal(vegas2027.status, 200);
  const vegas2027Html = await vegas2027.text();
  assert.match(vegas2027Html, /Source check needed/);
  assert.match(vegas2027Html, /June 15, 2027 is Tuesday/);
  assert.match(vegas2027Html, /15 planned · names open/);
  assert.match(vegas2027Html, /9 sponsor passes · 15 attendees planned/);
  assert.match(vegas2027Html, /Caesars Forum/);

  const chicago = await render("/events/ccw-exchange-chicago");
  const chicagoHtml = await chicago.text();
  assert.match(chicagoHtml, /Taylor is the confirmed attendee/);
  assert.match(chicagoHtml, /Carter and Josh are marked available/);
  assert.match(chicagoHtml, /Source check needed/);
  assert.match(chicagoHtml, /1 named · 2 planned/);
  assert.match(chicagoHtml, /Guaranteed meetings<\/span><strong>Included · count TBD/);
  assert.match(chicagoHtml, /internal ICP sheet has 28 researched accounts/);
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

  const retail = await render("/events/iqpc-cx-retail-uk");
  const retailHtml = await retail.text();
  assert.match(retailHtml, /Guaranteed meetings<\/span><strong>count not recorded/);
  assert.match(retailHtml, /Meetings recorded<\/span><strong>10–15/);
  assert.doesNotMatch(retailHtml, /10–15 Guaranteed Meetings/);
});
