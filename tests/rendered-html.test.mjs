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

function assertSectionOrder(html, ids) {
  let previous = -1;
  for (const id of ids) {
    const position = html.indexOf(`id="${id}"`);
    assert.ok(position > previous, `${id} should render after the previous event section`);
    previous = position;
  }
}

test("server-renders the event directory", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Event Basecamp · 2026–2027<\/title>/i);
  assert.match(html, /property="og:image" content="https:\/\/teamsimple-events-fieldbook\.holden165736\.chatgpt\.site\/og-2026-2027\.png"/);
  assert.match(html, /name="twitter:image" content="https:\/\/teamsimple-events-fieldbook\.holden165736\.chatgpt\.site\/og-2026-2027\.png"/);
  assert.match(html, /rel="canonical" href="https:\/\/teamsimple-events-fieldbook\.holden165736\.chatgpt\.site\/"/);
  assert.match(html, /aria-label="TeamSimple Event Basecamp home"/);
  assert.match(html, /dateTime="2026-08-07"[^>]*aria-label="Last updated Aug 07 · 2026"/);
  assert.match(html, /TeamSimple/);
  assert.match(html, /Luck is what happens when preparation meets opportunity\./);
  assert.match(html, /What do you need to do\?/);
  assert.match(html, /Use the role and process pages for tips that are useful no matter where you(?:&#x27;|')re headed\./);
  assert.match(html, /Get the plan for one event\./);
  assert.match(html, /Prepare and run the conversation\./);
  assert.match(html, /Target, qualify, and route\./);
  assert.match(html, /See the support plan and open work\./);
  assert.match(html, /Check the standard rules\./);
  assert.match(html, /See what changed and what conflicts\./);
  assert.match(html, /href="#events"/);
  assert.match(html, /href="\/sources"/);
  assert.match(html, /class="footer-back-to-top" href="#page-top"[^>]*>[\s\S]*Back to top/);
  assert.match(html, /Open your event before you travel, promote it, or work the floor/);
  assert.match(html, /prospecting targets, onsite rules, and the programs actually in play/);
  assert.doesNotMatch(html, /page says “None/);
  assert.match(html, /ranger-raccoon-clean-hat\.png/);
  assert.match(html, /class="ranger-hat-logo"/);
  assert.match(html, /find your event and read the TL;DR before you go/);
  assert.match(html, /Before you go/);
  assert.match(html, /Confirm your travel, hotel, credentials, and event app/);
  assert.match(html, /Review your meetings, sessions, target accounts, and booth coverage/);
  assert.match(html, /Try to connect with other attendees before the show/);
  assert.match(html, /Find my event/);
  assert.doesNotMatch(html, /before you book, ship, or promote/);
  assert.doesNotMatch(html, /ranger-raccoon-v2/);
  assert.match(html, /TeamSimple attendance/);
  assert.match(html, /Program year/);
  assert.match(html, /<span>All years<\/span><b>29<\/b>/);
  assert.match(html, /<span>2026<\/span><b>26<\/b>/);
  assert.match(html, /<span>2027<\/span><b>3<\/b>/);
  assert.match(html, /Needs attention/);
  assert.match(html, /Source issue<\/span><b>2<\/b>/);
  assert.match(html, /Roster open<\/span><b>12<\/b>/);
  assert.match(html, /Plan setup<\/span><b>9<\/b>/);
  assert.match(html, /Genesys Xperience/);
  assert.match(html, /CCW Orlando 2027/);
  assert.match(html, /CCW UK Executive Exchange 2027/);
  assert.match(html, /CCW Vegas 2027/);
  assert.match(html, /6 Guaranteed Meetings/);
  assert.match(html, /10\+ Guaranteed Meetings/);
  assert.match(html, /11(?:<!-- -->)? Planned/);
  assert.match(html, /15(?:<!-- -->)? Planned/);
  assert.match(html, /Negative Feedback/);
  assert.match(html, /2(?:<!-- -->)? Follow-up Meetings/);
  assert.match(html, /16(?:<!-- -->)? Meetings Recorded/);
  assert.match(html, /54(?:<!-- -->)? Meetings Recorded/);
  assert.match(html, /20(?:<!-- -->)? Demos Recorded/);
  assert.match(html, /Speaking TBD/);
  assert.match(html, /Program pulse/);
  assert.match(html, /id="event-lifecycle"/);
  assert.match(html, /What happens before, during, and after every event\./);
  for (const stage of ["Choose the event", "Build the plan", "Reach the audience", "Prepare the team", "Run the event", "Follow up and learn"]) assert.match(html, new RegExp(`>${stage}<`));
  for (const timing of ["Before approval", "After approval", "Before the event", "Final prep", "At the event", "After the event"]) assert.match(html, new RegExp(`>${timing}<`));
  assert.match(html, /Review the decision record/);
  assert.match(html, /Find the onsite brief/);
  assert.match(html, /href="\/marketing#measurement"/);
  assert.match(html, /What’s next—and what still needs attention\./);
  assert.match(html, /happening now/);
  assert.match(html, /starting within 60 days/);
  assert.match(html, /rosters incomplete/);
  assert.match(html, /source conflicts/);
  assert.match(html, /Tracked task lists[\s\S]*4(?:<!-- -->)? \/ (?:<!-- -->)?13/);
  assert.match(html, /Checklist setup needed[\s\S]*9/);
  assert.match(html, /Due or overdue now[\s\S]*1/);
  assert.match(html, /Next action/);
  assert.match(html, /Owner · Holden \+ AP/);
  assert.match(html, /Owner · Open[\s\S]*Due · Open/);
  assert.match(html, /Current and next stops/);
  assert.match(html, /Earliest plans with open inputs/);
  assert.match(html, /\+\d+ more on the brief/);
  assert.match(html, /Open source and approval record/);
  assert.match(html, /Current(?:<!-- -->)? · <time dateTime="2026-08-07">Aug 7<\/time>/);
  assert.match(html, /Source checks due[\s\S]*\d+/);
  assert.match(html, /Direct update \+ 4/);
  assert.match(html, /CCW Orlando[\s\S]*7(?:<!-- -->)? Meetings Recorded/);
  assert.match(html, /Guaranteed Meetings · Count TBD/);
  assert.doesNotMatch(html, /Resolve these before more work starts\./);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Building your site/i);
});

test("primary navigation identifies the current destination", async () => {
  const cases = [
    ["/", "/#events", "Events"],
    ["/events/genesys-xperience", "/#events", "Events"],
    ["/guides", "/guides", "Guides"],
    ["/ae", "/ae", "AEs"],
    ["/sdr", "/sdr", "SDRs"],
    ["/marketing", "/marketing", "Marketing"],
    ["/leadership", "/leadership", "Leaders"],
    ["/search", "/search", "Search"],
  ];
  for (const [route, href, label] of cases) {
    const response = await render(route);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1, `${route} should expose one current destination`);
    assert.match(html, new RegExp(`<a(?=[^>]*href="${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}")(?=[^>]*aria-current="page")[^>]*>${label}</a>`));
  }
});

test("server-renders the source monitor and approval queue", async () => {
  const response = await render("/sources");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Fix the source that owns the fact\./);
  assert.match(html, /A Slack message or email is evidence—not the final record\./);
  assert.match(html, /id="action-briefing"/);
  assert.match(html, /Ping me only when I need to act\./);
  assert.match(html, /Private Slack DM/);
  assert.match(html, /No action means no Slack noise\./);
  assert.match(html, /Reply with the item number and answer/);
  assert.match(html, /What the next briefing would ask/);
  assert.match(html, /Slack action briefing \+ Codex receipt/);
  assert.match(html, /Dates · participation · roster[\s\S]*Conference tracker/);
  assert.match(html, /Tasks · owners · decisions[\s\S]*Event project/);
  assert.match(html, /Contracts · creative · files[\s\S]*Events Drive/);
  assert.match(html, /Meetings · demos · pipeline[\s\S]*HubSpot/);
  assert.match(html, /Source monitor/);
  assert.match(html, /id="latest-scan"/);
  assert.match(html, /What the 9:00 AM scan actually did\./);
  assert.match(html, /Latest scheduled run/);
  assert.match(html, /<span>Audit<\/span><strong>Complete<\/strong>/);
  assert.match(html, /<span>Needs review<\/span><strong>3<\/strong>/);
  assert.match(html, /<span>No change<\/span><strong>2<\/strong>/);
  assert.match(html, /<span>Rejected<\/span><strong>0<\/strong>/);
  assert.match(html, /Review build[\s\S]*No publishable change/);
  assert.match(html, /Production[\s\S]*Approval required/);
  assert.match(html, /Upstream write-back[\s\S]*Exact approval required/);
  assert.match(html, /Conference tracker[\s\S]*Not due/);
  assert.match(html, /Granola[\s\S]*Unavailable/);
  assert.match(html, /HubSpot[\s\S]*Checked/);
  assert.match(html, /Customer Connect Expo[\s\S]*Priority actions/);
  assert.match(html, /Customer Connect Expo[\s\S]*Marketing tasks/);
  assert.match(html, /Customer Connect Expo[\s\S]*Sponsorship workstream/);
  assert.match(html, /The closer the event, the tighter the check\./);
  assert.match(html, /Connected does not mean live\./);
  assert.match(html, /Verified access · Aug 7/);
  assert.match(html, /Technical access and operating permission are separate/);
  assert.match(html, /Marketing Events \+ CRM records writable · segments read-only/);
  assert.match(html, /existing segments can be audited, but segment creation is not available/i);
  assert.match(html, /All 29 event records carry the canonical key/);
  assert.match(html, /Connected signal sources/);
  assert.match(html, /Google Sheets · conference tracker/);
  assert.match(html, /Can we write back\?/);
  assert.match(html, /One event brief/);
  assert.match(html, /Portfolio and outcomes/);
  assert.match(html, /One durable join across every system\./);
  assert.match(html, /genesys-xperience/);
  assert.match(html, /HubSpot meetings/);
  assert.match(html, /Published event keys[\s\S]*29(?:<!-- -->)? \/ (?:<!-- -->)?29/);
  assert.match(html, /Active Notion projects[\s\S]*9(?:<!-- -->)? \/ (?:<!-- -->)?13/);
  assert.match(html, /Active Drive folders[\s\S]*0(?:<!-- -->)? \/ (?:<!-- -->)?13/);
  assert.match(html, /Active Marketing Events[\s\S]*13(?:<!-- -->)? \/ (?:<!-- -->)?13/);
  assert.match(html, /Active workspaces still missing[\s\S]*CCW UK Executive Exchange 2027/);
  assert.match(html, /Canonical Event key column/);
  assert.match(html, /Canonical Event key property/);
  assert.match(html, /Happening now[\s\S]*Daily/);
  assert.match(html, /Starts within 14 days[\s\S]*Every 3 days/);
  assert.match(html, /More than 60 days away[\s\S]*Monthly/);
  assert.match(html, /A scheduled snapshot, not a live database\./);
  assert.match(html, /Every scan becomes one auditable batch\./);
  assert.match(html, /Apply to review|apply to review/);
  assert.match(html, /Checked, unavailable and not-due sources stay visible/);
  assert.match(html, /No silent omissions\./);
  assert.match(html, /A review build cannot clear the scan gate unless the batch records what it checked/);
  assert.match(html, /Checked[\s\S]*The source was read for the named scope/);
  assert.match(html, /Unavailable[\s\S]*missing access or artifact/);
  assert.match(html, /Not due[\s\S]*freshness window/);
  assert.match(html, /no upstream write runs without exact approval/);
  assert.match(html, /The remaining joins:/);
  assert.match(html, /HubSpot Marketing Event now shares the stable Event key/);
  assert.match(html, /Stable event keys[\s\S]*29/);
  assert.match(html, /Blocking errors[\s\S]*0/);
  assert.match(html, /Rosters to name[\s\S]*11/);
  assert.match(html, /Source conflicts[\s\S]*3/);
  assert.match(html, /Update the system that owns the fact\./);
  assert.match(html, /Reconcile any related execution text in Notion; the next review build refreshes Event Basecamp/);
  assert.match(html, /Only publish outcomes the CRM can prove\./);
  assert.match(html, /Exact event deals[\s\S]*29/);
  assert.match(html, /Portfolio opportunity views/);
  assert.match(html, /22(?:<!-- -->)? source-based · (?:<!-- -->)?21(?:<!-- -->)? exact CCW/);
  assert.match(html, /Deal Source search returns (?:<!-- -->)?30(?:<!-- -->)? records and (?:<!-- -->)?22(?:<!-- -->)? qualifying opportunities/);
  assert.match(html, /exact source \+ CCW detail intersection contains (?:<!-- -->)?29(?:<!-- -->)? records and (?:<!-- -->)?21(?:<!-- -->)? qualifying opportunities/);
  assert.match(html, /All (?:<!-- -->)?22(?:<!-- -->)? source-based opportunities lack a reportable amount/);
  assert.match(html, /href="\/marketing#event-pipeline"[^>]*>Open pipeline chart/);
  assert.match(html, /Needs RevOps review[\s\S]*2(?:<!-- -->)? records/);
  assert.match(html, /source and detail searches each return 30 deals, but only 29 records intersect/);
  assert.match(html, /Open source-only record/);
  assert.match(html, /Open detail-only record/);
  assert.match(html, /Meeting records to QA[\s\S]*4/);
  assert.match(html, /Keyed Marketing Events[\s\S]*29/);
  assert.match(html, /Do not count date proximity, a vendor mention/);
  assert.match(html, /Tracker outcome columns should become rollups or references/);
  assert.match(html, /One maintained segment per active event—once the evidence exists\./);
  assert.match(html, /Active events[\s\S]*14/);
  assert.match(html, /Segment specs ready[\s\S]*7/);
  assert.match(html, /Waiting on organizer files[\s\S]*7/);
  assert.match(html, /Automatically maintained[\s\S]*0/);
  assert.match(html, /The specifications are ready\. The active segments are not\./);
  assert.match(html, /targeting—not proof of attendance/i);
  assert.match(html, /Genesys Xperience[\s\S]*Specification ready/);
  assert.match(html, /<strong>6<\/strong><span>Waiting on organizer files/);
  assert.match(html, /Enriched ZI List — matched CCW attendees/);
  assert.match(html, /NiCE World 2026 — Tommy Prospects/);
  assert.match(html, /Keep the work with the person closest to it\./);
  assert.match(html, /AEs and SDRs[\s\S]*Before the event day ends/);
  assert.match(html, /Event lead[\s\S]*The same business day/);
  assert.match(html, /Marketing Ops[\s\S]*Before the next Event Basecamp review build/);
  assert.match(html, /Leadership[\s\S]*When explicitly escalated/);
  assert.match(html, /Routine correction[\s\S]*Material decision[\s\S]*Published receipt/);
  assert.match(html, /Changes that belong upstream\./);
  assert.match(html, /Contact\.io participation[\s\S]*Status: TBD[\s\S]*Status: No/);
  assert.match(html, /Customer Connect Expo participation[\s\S]*Status blank[\s\S]*Status: Confirmed/);
  assert.match(html, /ICMI participation[\s\S]*Status: Tentative[\s\S]*Status: Confirmed/);
  assert.match(html, /Genesys Xperience roster[\s\S]*Cat, Matt, Taylor and Josh[\s\S]*Holden[\s\S]*Richard and Lars/);
  assert.match(html, /CCW Vegas 2027 workshop date[\s\S]*June 15, 2027 is Tuesday/);
  assert.match(html, /Replace Monaco with HubSpot/);
  assert.match(html, /Genesys Wish Line activation[\s\S]*quarter-mile taxi geofence/);
  assert.match(html, /Meeting attribution and outcome QA/);
  assert.match(html, /Normalized event-cost ledger[\s\S]*Add a Costs tab keyed by Event key/);
  assert.match(html, /2 say Scheduled and 2 have no outcome/);
  assert.match(html, /Adopt the Marketing Event as the CRM event spine/);
  assert.match(html, /Active event audience segments[\s\S]*0 active-event segments are automatically maintained/);
  assert.match(html, /Nothing in this queue writes to an external system until the exact change is approved/);
  assert.match(html, /What changed, and why\./);
  assert.match(html, /<span>Applied<\/span><strong>14<\/strong>/);
  assert.match(html, /<span>Needs review<\/span><strong>3<\/strong>/);
  assert.match(html, /<span>No change<\/span><strong>5<\/strong>/);
  assert.match(html, /Accepted Gabby Pring’s Customer Connect answers/);
  assert.match(html, /Aug 11 at 9:30 AM PT/);
  assert.match(html, /insurance recommended, not mandatory/);
  assert.match(html, /Confirmed Taylor as the sole Chicago attendee/);
  assert.match(html, /Taylor only · Josh did not attend/);
  assert.match(html, /Reconcile two CCW controlled-field mismatches/);
  assert.match(html, /Pre-reconciliation exact CCW baseline still held/);
  assert.match(html, /Upstream write-back verification/);
  assert.match(html, /Four corrections remain/);
  assert.match(html, /Genesys guaranteed meetings already match/);
  assert.match(html, /Added the 2027 event program/);
  assert.match(html, /26 events · 2026 only/);
  assert.match(html, /29 events · 2026–2027/);
  assert.match(html, /Daily · 9:00 AM PT/);
  assert.match(html, /Verified automation:/);
  assert.match(html, /event-fieldbook-source-scan/);
  assert.match(html, /Every receipt must identify whether it came from the scheduled heartbeat or a task review/);
  assert.match(html, /Do not let stale sources undo these\./);
  assert.match(html, /Contact\.io[\s\S]*Not attending/);
  assert.match(html, /Genesys Xperience[\s\S]*Guaranteed meetings[\s\S]*None/);
  assert.match(html, /CCW Vegas 2027[\s\S]*1 speaking opportunity/);
  assert.match(html, /Direct confirmation/);
  assert.match(html, /A successful scan may save a review version/);
  assert.match(html, /Conference tracker/);
  assert.match(html, /Not due · no due or overdue events · Aug 7/);
  assert.match(html, /2 near-term searches · no match · Aug 7/);
  assert.match(html, /29 keyed Marketing Events · 30 source · 30 detail · 29 exact deals · 2 mismatches · Aug 7/);
  assert.match(html, /No direct scan available/);
  assert.match(html, /HubSpot/);
  assert.match(html, /Granola/);
  assert.doesNotMatch(html, /first run pending/);
  assert.match(html, /Latest evidence refresh · Scheduled heartbeat: Aug 07, 2026 · 9:00 AM PT · scheduled source scan/);
  assert.match(html, /four systems are read on a schedule/);
  assert.match(html, /zero sources push directly into production/);
  assert.match(html, /Make the joins trustworthy before adding more dashboards\./);
  assert.match(html, /Put the Event key in every owning system/);
  assert.match(html, /Customer Connect priorities · organizer call[\s\S]*Notion project blank/);
  assert.match(html, /Customer Connect task plan · organizer call[\s\S]*Notion project blank/);
  assert.match(html, /Customer Connect sponsorship workstream[\s\S]*Notion project blank/);
  assert.match(html, /First end-to-end source baseline/);
  assert.match(html, /all explicitly attributed to CCW Vegas/);
  assert.match(html, /Approval queue/);
  assert.match(html, /CCW Exchange Chicago/);
  assert.match(html, /CCW Exchange Chicago final roster[\s\S]*Taylor was the sole attendee/);
  assert.match(html, /IQPC CX Travel &amp; Hospitality/);
  assert.match(html, /calendar record lists Zach \+ Taylor/);
  assert.match(html, /Source check history/);
  assert.match(html, /Current truth first\. Older receipts stay for the audit trail\./);
  assert.match(html, /Use records marked[\s\S]*Current[\s\S]*for today’s operating state/);
  assert.match(html, /Superseded[\s\S]*The Aug 7 full Marketing Event audit that found 29 keyed records/);
  assert.match(html, /Scheduled source scan · 9:00 AM PT/);
  assert.match(html, /CCW Exchange Chicago closeout check · 6:42 AM PT/);
  assert.match(html, /29 of 29 exact event-sourced deals/);
  assert.match(html, /four are possible on-site meetings/);
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
  assert.match(html, /Customer Connect priorities · organizer call[\s\S]*Aug 11 at 9:30 AM PT/);
  assert.match(html, /2027 conference tracker/);
  assert.match(html, /Three confirmed 2027 events were added/);
  assert.match(html, /“Mon Jun 15” workshop label conflicts/);
});

test("server-renders the leadership portfolio without unsupported ROI claims", async () => {
  const response = await render("/leadership");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /See the program without losing the source truth\./);
  assert.match(html, /Active program<\/span><p>Confirmed, tentative and TBD events/);
  assert.match(html, /Briefs on track/);
  assert.match(html, /2(?:<!-- -->)? \/ (?:<!-- -->)?13/);
  assert.match(html, /Planning gaps open/);
  assert.match(html, /What changed—and what still needs a decision\./);
  assert.match(html, /14<\/strong><span>Applied updates/);
  assert.match(html, /3<\/strong><span>Needs review/);
  assert.match(html, /Customer Connect Expo[\s\S]*Accepted Gabby Pring’s Customer Connect answers/);
  assert.match(html, /Genesys Xperience[\s\S]*Confirmed the Genesys Xperience roster/);
  assert.match(html, /href="\/events\/genesys-xperience#event-changes"/);
  assert.match(html, /Program-wide[\s\S]*Added the 2027 event program/);
  assert.match(html, /href="\/sources#change-log"/);
  assert.match(html, /Confirmed Taylor as the sole Chicago attendee[\s\S]*Taylor only/);
  assert.match(html, /Every active commitment and its next move\./);
  assert.match(html, /Closed CCW Exchange Chicago with conservative outcomes/);
  assert.match(html, /CCW Vegas 2027/);
  assert.match(html, /No normalized event-cost dataset exists yet\./);
  assert.match(html, /0(?:<!-- -->)? of (?:<!-- -->)?13(?:<!-- -->)? active events have an exact CRM join\./);
  assert.match(html, /9(?:<!-- -->)? active event workspaces are linked/);
  assert.match(html, /Leadership gets decisions, not data-entry work\./);
  assert.match(html, /Needs judgment[\s\S]*2/);
  assert.match(html, /Ready to approve<\/span><strong>21/);
  assert.match(html, /Foundation work<\/span><strong>10/);
  assert.match(html, /Source-based opportunities[\s\S]*22/);
  assert.match(html, /Exact CCW opportunities[\s\S]*21/);
  assert.match(html, /Open pipeline[\s\S]*\$0/);
  assert.match(html, /Closed-won revenue[\s\S]*\$0/);
  assert.match(html, /Read the populations correctly\./);
  assert.match(html, /Deal Source search returns (?:<!-- -->)?30(?:<!-- -->)? records and (?:<!-- -->)?22(?:<!-- -->)? qualifying opportunities/);
  assert.match(html, /exact CCW intersection contains (?:<!-- -->)?29(?:<!-- -->)? records and (?:<!-- -->)?21(?:<!-- -->)? qualifying opportunities/);
  assert.match(html, /2(?:<!-- -->)? records need field QA: (?:<!-- -->)?1(?:<!-- -->)? source-only and (?:<!-- -->)?1(?:<!-- -->)? detail-only/);
  assert.match(html, /\$0 pipeline and revenue describe CRM completeness—not the business value/);
  assert.match(html, /<a[^>]*href="\/leadership"[^>]*>Leaders<\/a>/);
});

test("server-renders searchable event outcomes and filter counts", async () => {
  const response = await render("/search?q=names%20open&type=Event");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Find the detail, not the page\./);
  assert.match(html, /value="names open"/);
  assert.match(html, /Results open the exact section or working system you need/);
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
  assert.match(sourceSearchHtml, /Source check · Aug 7, 2026 · Direct update · OOH meeting notes · Notion · Gmail · HubSpot · Restricted Genesys brief/);

  const activationSearch = await render("/search?q=Wish%20Line%20route&type=Event");
  assert.equal(activationSearch.status, 200);
  const activationSearchHtml = await activationSearch.text();
  assert.match(activationSearchHtml, /Genesys Xperience/);
  assert.match(activationSearchHtml, /Activation route · 0\.25-mile geofence · Bellagio to Fontainebleau · ~10-minute loop/);
  assert.match(activationSearchHtml, /Activation status · AP confirmation pending/);

  const startSearch = await render("/search?q=where%20should%20I%20go&type=Guide");
  assert.equal(startSearch.status, 200);
  const startSearchHtml = await startSearch.text();
  assert.match(startSearchHtml, /Start with the task/);
  assert.match(startSearchHtml, /\/#start-map/);

  const pulseSearch = await render("/search?q=what%20needs%20attention&type=Operations");
  assert.equal(pulseSearch.status, 200);
  const pulseSearchHtml = await pulseSearch.text();
  assert.match(pulseSearchHtml, /Active event program pulse/);
  assert.match(pulseSearchHtml, /\/#program-pulse/);

  const briefingSearch = await render("/search?q=ping%20me%20for%20updates&type=Operations");
  assert.equal(briefingSearch.status, 200);
  const briefingSearchHtml = await briefingSearch.text();
  assert.match(briefingSearchHtml, /Daily event action briefing/);
  assert.match(briefingSearchHtml, /\/sources#action-briefing/);

  const writebackSearch = await render("/search?q=write%20back&type=Operations");
  assert.equal(writebackSearch.status, 200);
  const writebackSearchHtml = await writebackSearch.text();
  assert.match(writebackSearchHtml, /Source write-back queue/);
  assert.match(writebackSearchHtml, /\/sources#writeback-queue/);

  const measurementSearch = await render("/search?q=event%20measurement%20contract&type=Operations");
  assert.equal(measurementSearch.status, 200);
  const measurementSearchHtml = await measurementSearch.text();
  assert.match(measurementSearchHtml, /Event measurement contract/);
  assert.match(measurementSearchHtml, /\/marketing#measurement/);

  const marketingWorkloadSearch = await render("/search?q=overdue%20marketing%20tasks&type=Operations");
  assert.equal(marketingWorkloadSearch.status, 200);
  const marketingWorkloadHtml = await marketingWorkloadSearch.text();
  assert.match(marketingWorkloadHtml, /Marketing workload pulse/);
  assert.match(marketingWorkloadHtml, /\/marketing#marketing-pulse/);

  const stewardshipSearch = await render("/search?q=who%20updates%20event%20data&type=Operations");
  assert.equal(stewardshipSearch.status, 200);
  const stewardshipSearchHtml = await stewardshipSearch.text();
  assert.match(stewardshipSearchHtml, /Who updates event data/);
  assert.match(stewardshipSearchHtml, /\/sources#stewardship/);

  const naturalStaffingSearch = await render("/search?q=who%27s%20going%20to%20Genesys&type=Event");
  assert.equal(naturalStaffingSearch.status, 200);
  const naturalStaffingHtml = await naturalStaffingSearch.text();
  assert.match(naturalStaffingHtml, /Genesys Xperience/);
  assert.match(naturalStaffingHtml, /Team · Cat, Holden, Matt, Taylor, Josh, Carter, Deepti, Richard, Lars/);
  assert.match(naturalStaffingHtml, /href="\/events\/genesys-xperience#event-crew"/);

  const outcomeSearch = await render("/search?q=what%20happened%20at%20Chicago&type=Event");
  assert.equal(outcomeSearch.status, 200);
  const outcomeSearchHtml = await outcomeSearch.text();
  assert.match(outcomeSearchHtml, /CCW Exchange Chicago · results/);
  assert.match(outcomeSearchHtml, /href="\/events\/ccw-exchange-chicago#event-results"/);
  assert.match(outcomeSearchHtml, /Event section · Results/);

  const targetSearch = await render("/search?q=who%20should%20we%20target%20at%20Genesys&type=Event");
  assert.equal(targetSearch.status, 200);
  const targetSearchHtml = await targetSearch.text();
  assert.match(targetSearchHtml, /Genesys Xperience · prospecting/);
  assert.match(targetSearchHtml, /href="\/events\/genesys-xperience#event-prospecting"/);

  const travelSearch = await render("/search?q=Genesys%20travel&type=Event");
  assert.equal(travelSearch.status, 200);
  const travelSearchHtml = await travelSearch.text();
  assert.match(travelSearchHtml, /Genesys Xperience · Travel/);
  assert.match(travelSearchHtml, /href="\/events\/genesys-xperience#workstream-travel"/);

  const rulesSearch = await render("/search?q=Genesys%20rules&type=Event");
  assert.equal(rulesSearch.status, 200);
  const rulesSearchHtml = await rulesSearch.text();
  assert.match(rulesSearchHtml, /Genesys Xperience · rules of engagement/);
  assert.match(rulesSearchHtml, /href="\/events\/genesys-xperience#event-considerations"/);

  const liveStreamSearch = await render("/search?q=what%27s%20live&type=Operations");
  assert.equal(liveStreamSearch.status, 200);
  const liveStreamHtml = await liveStreamSearch.text();
  assert.match(liveStreamHtml, /Data feeds and write-back/);
  assert.match(liveStreamHtml, /\/sources#data-streams/);

  const durabilitySearch = await render("/search?q=how%20does%20this%20site%20stay%20useful&type=Operations");
  assert.equal(durabilitySearch.status, 200);
  const durabilitySearchHtml = await durabilitySearch.text();
  assert.match(durabilitySearchHtml, /Event data operating roadmap/);
  assert.match(durabilitySearchHtml, /\/sources#operating-roadmap/);

  const scanContractSearch = await render("/search?q=source%20scan%20batch&type=Operations");
  assert.equal(scanContractSearch.status, 200);
  const scanContractSearchHtml = await scanContractSearch.text();
  assert.match(scanContractSearchHtml, /Source scan automation contract/);
  assert.match(scanContractSearchHtml, /\/sources#scan-contract/);

  const latestScanSearch = await render("/search?q=scheduled%20source%20scan%20not%20due&type=Operations");
  assert.equal(latestScanSearch.status, 200);
  const latestScanSearchHtml = await latestScanSearch.text();
  assert.match(latestScanSearchHtml, /Latest scheduled source scan/);
  assert.match(latestScanSearchHtml, /href="\/sources#latest-scan"/);
  assert.match(latestScanSearchHtml, /Audit complete/);
  assert.match(latestScanSearchHtml, /5 findings · 3 need review · 2 no change/);

  const lifecycleSearch = await render("/search?q=what%20do%20I%20do%20after%20an%20event&type=Guide");
  assert.equal(lifecycleSearch.status, 200);
  const lifecycleSearchHtml = await lifecycleSearch.text();
  assert.match(lifecycleSearchHtml, /Event process/);
  assert.match(lifecycleSearchHtml, /href="\/#event-lifecycle"/);

  const hubspotWriteSearch = await render("/search?q=can%20I%20write%20HubSpot%20meetings&type=Operations");
  assert.equal(hubspotWriteSearch.status, 200);
  const hubspotWriteHtml = await hubspotWriteSearch.text();
  assert.match(hubspotWriteHtml, /HubSpot connector access/);
  assert.match(hubspotWriteHtml, /CRM records writable · segments read-only/);
  assert.match(hubspotWriteHtml, /href="\/sources#data-streams"/);

  const slackWriteSearch = await render("/search?q=can%20I%20write%20event%20facts%20to%20Slack&type=Operations");
  assert.equal(slackWriteSearch.status, 200);
  const slackWriteHtml = await slackWriteSearch.text();
  assert.match(slackWriteHtml, /Slack \+ Gmail connector access/);
  assert.match(slackWriteHtml, /Do not back-write event facts into a thread/);

  const rosterGapSearch = await render("/search?q=roster%20missing&type=Operations");
  assert.equal(rosterGapSearch.status, 200);
  const rosterGapSearchHtml = await rosterGapSearch.text();
  assert.match(rosterGapSearchHtml, /Events with rosters still open/);
  assert.match(rosterGapSearchHtml, /href="\/\?attendance=going&amp;attention=roster#events"/);
  assert.match(rosterGapSearchHtml, /Saved event view/);

  const meetingCountSearch = await render("/search?q=guaranteed%20meeting%20count%20unknown&type=Operations");
  assert.equal(meetingCountSearch.status, 200);
  const meetingCountSearchHtml = await meetingCountSearch.text();
  assert.match(meetingCountSearchHtml, /Guaranteed-meeting counts still open/);
  assert.match(meetingCountSearchHtml, /href="\/\?attendance=going&amp;attention=meetings#events"/);

  const liveFeedSearch = await render("/search?q=which%20data%20feeds%20are%20live&type=Operations");
  assert.equal(liveFeedSearch.status, 200);
  const liveFeedSearchHtml = await liveFeedSearch.text();
  assert.match(liveFeedSearchHtml, /HubSpot · Marketing Events and CRM outcomes data stream/);
  assert.match(liveFeedSearchHtml, /Feeds · The Marketing Event is the CRM event spine/);
  assert.match(liveFeedSearchHtml, /Data stream/);

  const marketingEventRoleSearch = await render("/search?q=HubSpot%20Marketing%20Events%20current%20truth&type=Operations");
  assert.equal(marketingEventRoleSearch.status, 200);
  const marketingEventRoleSearchHtml = await marketingEventRoleSearch.text();
  assert.match(marketingEventRoleSearchHtml, /HubSpot Marketing Events · current role/);
  assert.match(marketingEventRoleSearchHtml, /29 keyed Marketing Event records provide CRM event identity/);
  assert.match(marketingEventRoleSearchHtml, /href="\/sources#marketing-event-role"/);

  const fieldOwnerSearch = await render("/search?q=where%20do%20I%20update%20meeting%20outcomes&type=Operations");
  assert.equal(fieldOwnerSearch.status, 200);
  const fieldOwnerSearchHtml = await fieldOwnerSearch.text();
  assert.match(fieldOwnerSearchHtml, /Meetings, demos, deals, pipeline and closed revenue · where to update/);
  assert.match(fieldOwnerSearchHtml, /Update in HubSpot/);
  assert.match(fieldOwnerSearchHtml, /System of record/);

  const exactWritebackSearch = await render("/search?q=Contact.io%20participation%20write%20back&type=Operations");
  assert.equal(exactWritebackSearch.status, 200);
  const exactWritebackSearchHtml = await exactWritebackSearch.text();
  assert.match(exactWritebackSearchHtml, /Contact.io participation · upstream work/);
  assert.match(exactWritebackSearchHtml, /Status: No · 0 attendees · clear the available roster/);
  assert.match(exactWritebackSearchHtml, /Ready for approval/);
  assert.match(exactWritebackSearchHtml, /Event source correction/);
  assert.match(exactWritebackSearchHtml, /href="\/events\/contact-io#event-writebacks"/);

  const genesysWritebackSearch = await render("/search?q=Genesys%20roster%20upstream&type=Operations");
  assert.equal(genesysWritebackSearch.status, 200);
  const genesysWritebackSearchHtml = await genesysWritebackSearch.text();
  assert.match(genesysWritebackSearchHtml, /Genesys Xperience roster · upstream work/);
  assert.match(genesysWritebackSearchHtml, /href="\/events\/genesys-xperience#event-writebacks"/);
  assert.match(genesysWritebackSearchHtml, /Cat, Holden, Matt, Taylor, Josh, Carter, Deepti, Richard and Lars attending/);

  const hubspotMismatchSearch = await render("/search?q=HubSpot%20source%20detail%20mismatch&type=Operations");
  assert.equal(hubspotMismatchSearch.status, 200);
  const hubspotMismatchSearchHtml = await hubspotMismatchSearch.text();
  assert.match(hubspotMismatchSearchHtml, /CCW Vegas · Reconcile two CCW controlled-field mismatches/);
  assert.match(hubspotMismatchSearchHtml, /29 exact intersections · 1 source-only record · 1 detail-only record/);
  assert.match(hubspotMismatchSearchHtml, /Source change/);

  const eventRoleSearch = await render("/search?q=what%20should%20an%20SDR%20do%20at%20Genesys&type=Event");
  assert.equal(eventRoleSearch.status, 200);
  const eventRoleSearchHtml = await eventRoleSearch.text();
  assert.match(eventRoleSearchHtml, /Genesys Xperience/);
  assert.match(eventRoleSearchHtml, /SDR route · Create traffic and qualify quickly/);
  assert.match(eventRoleSearchHtml, /Work the booth and nearby traffic/);

  const genesysChangeSearch = await render("/search?q=what%20changed%20at%20Genesys&type=Operations");
  assert.equal(genesysChangeSearch.status, 200);
  const genesysChangeSearchHtml = await genesysChangeSearch.text();
  assert.match(genesysChangeSearchHtml, /Genesys Xperience · Confirmed the Genesys Xperience roster/);
  assert.match(genesysChangeSearchHtml, /href="\/events\/genesys-xperience#event-changes"/);
  assert.match(genesysChangeSearchHtml, /Before · Shorter tracker roster · Carter listed only as available/);

  const chicagoChangeSearch = await render("/search?q=Taylor%20sole%20Chicago%20attendee&type=Operations");
  assert.equal(chicagoChangeSearch.status, 200);
  const chicagoChangeSearchHtml = await chicagoChangeSearch.text();
  assert.match(chicagoChangeSearchHtml, /CCW Exchange Chicago · Confirmed Taylor as the sole Chicago attendee/);
  assert.match(chicagoChangeSearchHtml, /href="\/events\/ccw-exchange-chicago#event-changes"/);
  assert.match(chicagoChangeSearchHtml, /Now · 1 attendee · Taylor only · Josh did not attend/);

  const programChangeSearch = await render("/search?q=Added%20the%202027%20event%20program&type=Operations");
  assert.equal(programChangeSearch.status, 200);
  const programChangeSearchHtml = await programChangeSearch.text();
  assert.doesNotMatch(programChangeSearchHtml, /<h2>Added the 2027 event program<\/h2>/);

  const emptySearch = await render("/search?q=definitely-no-such-event-or-guide");
  assert.equal(emptySearch.status, 200);
  const emptySearchHtml = await emptySearch.text();
  assert.match(emptySearchHtml, /Nothing found for “(?:<!-- -->)?definitely-no-such-event-or-guide(?:<!-- -->)?\.”/);
  assert.match(emptySearchHtml, /<button type="button">Clear search<\/button>/);
  assert.match(emptySearchHtml, /href="\/#events">Browse events/);
});

test("an unknown event route renders a useful branded recovery page", async () => {
  const response = await render("/events/not-a-real-event");
  assert.equal(response.status, 404);
  const html = await response.text();
  assert.match(html, /That page isn’t in Event Basecamp\./);
  assert.match(html, /Search Event Basecamp/);
  assert.match(html, /Browse every event/);
  assert.match(html, /Find the dates, team, plan, and links\./);
  assert.match(html, /See what changed and where to update it\./);
});

test("directory filters survive an event-page round trip", async () => {
  const filtered = await render("/?q=Genesys&attendance=going&year=2026");
  assert.equal(filtered.status, 200);
  const filteredHtml = await filtered.text();
  assert.match(filteredHtml, /value="Genesys"/);
  assert.match(filteredHtml, /Showing <strong>2<\/strong> of <!-- -->29<!-- --> events/);
  assert.match(filteredHtml, /href="\/events\/genesys-xperience\?returnTo=%2F%3Fq%3DGenesys%26attendance%3Dgoing%26year%3D2026%23events"/);

  const event = await render("/events/genesys-xperience?returnTo=%2F%3Fq%3DGenesys%26attendance%3Dgoing%26year%3D2026%23events");
  assert.equal(event.status, 200);
  const eventHtml = await event.text();
  assert.match(eventHtml, /href="\/\?q=Genesys&amp;attendance=going&amp;year=2026#events"[^>]*class="back-link"/);

  const unsafe = await render("/events/genesys-xperience?returnTo=https%3A%2F%2Fevil.example%2F%23events");
  assert.equal(unsafe.status, 200);
  assert.match(await unsafe.text(), /href="\/#events"[^>]*class="back-link"/);

  const attentionFiltered = await render("/?attendance=going&attention=source&year=2026");
  assert.equal(attentionFiltered.status, 200);
  const attentionFilteredHtml = await attentionFiltered.text();
  assert.match(attentionFilteredHtml, /Showing <strong>1<\/strong> of (?:<!-- -->)?29(?:<!-- -->)? events/);
  assert.match(attentionFilteredHtml, /aria-pressed="true"><span>Source issue<\/span><b>1<\/b>/);
  assert.match(attentionFilteredHtml, /href="\/events\/iqpc-cx-travel-hospitality\?returnTo=%2F%3Fattendance%3Dgoing%26attention%3Dsource%26year%3D2026%23events"/);

  const attentionEvent = await render("/events/ccw-exchange-chicago?returnTo=%2F%3Fattendance%3Dgoing%26attention%3Dsource%26year%3D2026%23events");
  assert.equal(attentionEvent.status, 200);
  assert.match(await attentionEvent.text(), /href="\/\?attendance=going&amp;attention=source&amp;year=2026#events"[^>]*class="back-link"/);
});

test("server-renders a searchable marketing support board", async () => {
  const response = await render("/marketing?event=genesys-xperience");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /See the work and the gaps in one place\./);
  assert.match(html, /Keep a gifting kit ready/);
  assert.match(html, /approved menu, budget bands, vendors, address and consent checks/);
  assert.match(html, /id="marketing-pulse"/);
  assert.match(html, /What needs attention now\./);
  assert.match(html, /Checklist coverage/);
  assert.match(html, /Open tracked work/);
  assert.match(html, /Next shared deadline/);
  assert.match(html, /events still need task setup/);
  assert.match(html, /href="#event-tasks"/);
  assert.match(html, /href="\/marketing\?event=customer-connect-expo#event-tasks"/);
  assert.match(html, /href="\/marketing\?event=genesys-xperience#event-tasks"/);
  assert.match(html, /Find an event or task/);
  assert.match(html, /Support listed/);
  assert.match(html, /No support listed/);
  assert.match(html, /Team unassigned/);
  assert.match(html, /Task setup open/);
  assert.match(html, /Next open item/);
  assert.doesNotMatch(html, /Most urgent open item/);
  assert.match(html, /Cat, Holden, Matt, Taylor, Josh, Carter, Deepti, Richard, Lars/);
  assert.doesNotMatch(html, /Taylor · 1 of 2 named/);
  assert.match(html, /Keep each event’s execution list in its own tab/);
  assert.match(html, /Genesys Xperience/);
  assert.match(html, /Submit the contracted pre-event email copy/);
  assert.match(html, /Produce the booth-monitor product video/);
  assert.match(html, /AP submitted payment and Michael is waiting for confirmation/);
  assert.match(html, /no-U-turn loop, quarter-mile taxi geofence, and bonus spot-based placement are set/);
  assert.ok(html.indexOf("Deliver the final solution-talk deck") < html.indexOf("Submit the contracted pre-event email copy"));
  assert.match(html, /HubSpot form, campaign attribution, and 15-minute demo CTA are already live/);
  assert.match(html, /1 owner · 2 dates open/);
  assert.match(html, /Owner: Open · Due: Date and owner open/);
  assert.match(html, /aria-selected="true"[^>]*id="event-task-tab-genesys-xperience"/);
  assert.match(html, /id="event-task-tab-genesys-xperience"[^>]*tabindex="0"/);
  assert.doesNotMatch(html, /Confirm the next owner and deadline/);
  assert.match(html, /Use the event record as the CRM spine\./);
  assert.match(html, /Keyed Marketing Events/);
  assert.match(html, /13(?:<!-- -->)? of (?:<!-- -->)?13(?:<!-- -->)? active events have a keyed HubSpot event record/);
  assert.match(html, /Verify the event record/);
  assert.match(html, /Attach the campaign/);
  assert.match(html, /Track participant state/);
  assert.match(html, /registered, canceled, and attended states/);
  assert.match(html, /Join the commercial record/);
  assert.match(html, /https:\/\/knowledge\.hubspot\.com\/integrations\/use-marketing-events/);
  assert.match(html, /id="event-pipeline"/);
  assert.match(html, /What events have created in the pipeline\./);
  assert.match(html, /Source-based opportunities[\s\S]*22/);
  assert.match(html, /Open pipeline[\s\S]*\$0/);
  assert.match(html, /Closed-won revenue[\s\S]*\$0/);
  assert.match(html, /Deal Source view[\s\S]*30(?:<!-- -->)? records/);
  assert.match(html, /Exact CCW join[\s\S]*29(?:<!-- -->)? records/);
  assert.match(html, /Needs field QA[\s\S]*2(?:<!-- -->)? records/);
  assert.match(html, /Current stage distribution for 22 source-based event opportunities/);
  assert.match(html, /Demo completed[\s\S]*8/);
  assert.match(html, /All (?:<!-- -->)?22(?:<!-- -->)? source-based opportunities lack a reportable amount/);
  assert.match(html, /Closed Lost and Disqualified records stay out of opportunity totals/);
  assert.match(html, /Six records make the scorecard usable\./);
  assert.match(html, /Fully loaded cost[\s\S]*Forecast at approval · final by 7 days after/);
  assert.match(html, /30 and 90 days after[\s\S]*sourced pipeline · influenced pipeline · closed revenue/);
  assert.match(html, /Held meeting[\s\S]*Scheduled, blank-outcome and no-show records do not count/);
  assert.match(html, /Meeting-to-opportunity rate[\s\S]*Event-sourced opportunities ÷ held meetings/);
  assert.match(html, /Portfolio comparison is blocked today\./);
  assert.match(html, /Cvent’s 2026 event-value guidance/);
  assert.match(html, /HubSpot’s Marketing Events guidance/);
  assert.match(html, /Close the loop in the system that owns each fact/);
  assert.match(html, /Event Basecamp refreshes from those records after reconciliation/);
  assert.doesNotMatch(html, /Update this fieldbook, the tracker, the Notion project/);

  const customerConnect = await render("/marketing?event=customer-connect-expo");
  assert.equal(customerConnect.status, 200);
  const customerConnectHtml = await customerConnect.text();
  assert.ok(customerConnectHtml.indexOf("Confirm invoice payment status with AP") < customerConnectHtml.indexOf("Use the organizer onboarding call"));
  assert.match(customerConnectHtml, /Overdue/);
  assert.match(customerConnectHtml, /Reconcile portal deadlines and booth assets/);
  assert.match(customerConnectHtml, /Complete the exhibitor company profile/);
  assert.match(customerConnectHtml, /Aug 17/);

  const travelHospitality = await render("/marketing?event=iqpc-cx-travel-hospitality");
  assert.equal(travelHospitality.status, 200);
  const travelHospitalityHtml = await travelHospitality.text();
  assert.match(travelHospitalityHtml, /15 owners · 14 dates open/);
  assert.match(travelHospitalityHtml, /Confirm speaker and finalize title\/abstract with IQPC/);
  assert.match(travelHospitalityHtml, /Log booked meetings and demos in HubSpot with the required context/);
  assert.match(travelHospitalityHtml, /Owner: Open · Due: Open/);

  const retail = await render("/marketing?event=iqpc-cx-retail-atlanta");
  assert.equal(retail.status, 200);
  const retailHtml = await retail.text();
  assert.match(retailHtml, /13 owners · 12 dates open/);
  assert.match(retailHtml, /Confirm the plenary speaker/);
  assert.match(retailHtml, /retail seasonality wedge/);
  assert.match(retailHtml, /Log booked meetings and demos in HubSpot with the required context/);
});

test("search routes marketing tasks to the selected event workspace", async () => {
  const response = await render("/search?q=booth-monitor%20product%20video&type=Operations");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Genesys Xperience · Produce the booth-monitor product video/);
  assert.match(html, /\/marketing\?event=genesys-xperience#event-tasks/);
  assert.match(html, /Results open the exact section or working system you need/);

  const eventAction = await render("/search?q=Lunch%20%26%20Learn%20contracted&type=Operations");
  assert.equal(eventAction.status, 200);
  const eventActionHtml = await eventAction.text();
  assert.match(eventActionHtml, /ICMI Contact Center Expo · Confirm whether the Wednesday Lunch &amp; Learn is contracted/);
  assert.match(eventActionHtml, /\/events\/icmi-contact-center-expo#event-priorities/);
});

test("server-renders field-role CRM rules and the updated guide model", async () => {
  const ae = await render("/ae");
  assert.equal(ae.status, 200);
  const aeHtml = await ae.text();
  assert.match(aeHtml, /Turn event conversations into real next steps\./);
  assert.match(aeHtml, /src="\/ranger-ae-spyglass\.webp"/);
  assert.match(aeHtml, /The TeamSimple ranger raccoon looking through a spyglass/);

  const sdr = await render("/sdr");
  assert.equal(sdr.status, 200);
  const sdrHtml = await sdr.text();
  assert.match(sdrHtml, /role-hero-sdr/);
  assert.match(sdrHtml, /Turn event conversations into qualified meetings\./);
  assert.match(sdrHtml, /src="\/ranger-sdr-listening\.webp"/);
  assert.match(sdrHtml, /The TeamSimple ranger raccoon listening closely/);
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
  assert.match(guidesHtml, /src="\/ranger-guides-map\.webp"/);
  assert.match(guidesHtml, /The TeamSimple ranger raccoon thoughtfully reading a trail map/);
  assert.match(guidesHtml, /marketing production and budget work live in the event tabs/);
  assert.doesNotMatch(guidesHtml, /If the team is not doing something, the page says/);
});

test("server-renders the page-specific leadership and marketing mascots", async () => {
  const leadership = await render("/leadership");
  assert.equal(leadership.status, 200);
  const leadershipHtml = await leadership.text();
  assert.match(leadershipHtml, /src="\/ranger-leadership-rock\.webp"/);
  assert.match(leadershipHtml, /The TeamSimple ranger raccoon pointing ahead with one boot on a rock/);

  const marketing = await render("/marketing");
  assert.equal(marketing.status, 200);
  const marketingHtml = await marketing.text();
  assert.match(marketingHtml, /src="\/ranger-marketing-books\.webp"/);
  assert.match(marketingHtml, /The TeamSimple ranger raccoon peeking out from a giant pile/);
  assert.match(marketingHtml, /src="\/simple-mark\.svg"/);
});

test("server-renders dynamic event facts without empty filler notes", async () => {
  const genesys = await render("/events/genesys-xperience");
  assert.equal(genesys.status, 200);
  const genesysHtml = await genesys.text();
  assert.match(genesysHtml, /<title>Genesys Xperience · Event Basecamp<\/title>/);
  assert.match(genesysHtml, /name="description" content="TeamSimple event brief\. Sep 1–3, 2026 · Las Vegas, NV\. Open the current plan, links, and source status\."/);
  assert.match(genesysHtml, /rel="canonical" href="https:\/\/teamsimple-events-fieldbook\.holden165736\.chatgpt\.site\/events\/genesys-xperience"/);
  assert.match(genesysHtml, /property="og:url" content="https:\/\/teamsimple-events-fieldbook\.holden165736\.chatgpt\.site\/events\/genesys-xperience"/);
  assertSectionOrder(genesysHtml, [
    "event-tldr",
    "event-role-routes",
    "event-prospecting",
    "event-priorities",
    "event-considerations",
    "event-crew",
    "workstream-travel",
    "event-changes",
    "event-writebacks",
    "event-update-route",
  ]);
  assert.match(genesysHtml, /href="#event-priorities"[\s\S]*href="#event-considerations"[\s\S]*href="#event-crew"[\s\S]*href="#event-changes"/);
  assert.match(genesysHtml, /No guaranteed meetings/);
  assert.match(genesysHtml, /Open event project(?:<!-- -->)? ↗/);
  assert.match(genesysHtml, new RegExp(`href="${"https://www.notion.so/3aa6fee642fe81c88a89de617863507c"}"[^>]*>Open event project(?:<!-- -->)? ↗`));
  assert.match(genesysHtml, /Open all update routes →/);
  assert.match(genesysHtml, /id="event-role-routes"/);
  assert.match(genesysHtml, /href="#event-role-routes">Your role/);
  assert.match(genesysHtml, /href="#event-prospecting">Prospecting/);
  assert.match(genesysHtml, /Who is worth finding here\./);
  assert.match(genesysHtml, /Technology products[\s\S]*Genesys/);
  assert.match(genesysHtml, /Open ZoomInfo companies/);
  assert.match(genesysHtml, /Do not confuse targeting with attendance/);
  assert.match(genesysHtml, /No defensible event-specific HubSpot segment is linked yet/);
  assert.match(genesysHtml, /Start with what this event changes for you\./);
  assert.match(genesysHtml, /No guaranteed meeting package is listed/);
  assert.match(genesysHtml, /Work the booth and nearby traffic/);
  assert.match(genesysHtml, /7 task(?:<!-- -->)?s are(?:<!-- -->)? tracked for this event/);
  assert.match(genesysHtml, /1 open task(?:<!-- -->)? needs an owner; (?:<!-- -->)?2(?:<!-- -->)? need dated deadlines/);
  assert.match(genesysHtml, /href="\/ae#build-the-meeting-hypothesis"/);
  assert.match(genesysHtml, /href="\/sdr#how-to-work-the-event"/);
  assert.match(genesysHtml, /href="\/marketing\?event=genesys-xperience#event-tasks"/);
  assert.match(genesysHtml, /id="event-changes"/);
  assert.match(genesysHtml, /What changed for this event\./);
  assert.match(genesysHtml, /Applied changes are already reflected on this page\./);
  assert.doesNotMatch(genesysHtml, /already in this review build/);
  assert.match(genesysHtml, /Confirmed the Genesys Xperience roster/);
  assert.match(genesysHtml, /Updated the Genesys sponsor-email deadline/);
  assert.match(genesysHtml, /Recorded the Wish Line route and operating plan/);
  assert.match(genesysHtml, /Genesys guaranteed meetings already match/);
  assert.match(genesysHtml, /href="\/sources#change-log">Open full log →/);
  assert.match(genesysHtml, /Current(?:<!-- -->)? · checked <time dateTime="2026-08-07">Aug 7, 2026<\/time>/);
  assert.match(genesysHtml, /Next check Aug 14/);
  assert.match(genesysHtml, /Update the source that owns it\./);
  assert.match(genesysHtml, /id="event-writebacks"/);
  assert.match(genesysHtml, /Source records still need to catch up\./);
  assert.match(genesysHtml, /Genesys Xperience roster[\s\S]*Current source[\s\S]*Proposed source/);
  assert.match(genesysHtml, /Genesys roster reference/);
  assert.match(genesysHtml, /Genesys Wish Line activation/);
  assert.match(genesysHtml, /Genesys speaking plan/);
  assert.match(genesysHtml, /Genesys CRM logging route/);
  assert.match(genesysHtml, /gid=0&amp;range=A16:W16/);
  assert.match(genesysHtml, /Open event row(?:<!-- -->)? ↗/);
  assert.match(genesysHtml, /Canonical Event key/);
  assert.match(genesysHtml, /\[evt:(?:<!-- -->)?genesys-xperience(?:<!-- -->)?\]/);
  assert.match(genesysHtml, /Dates · participation · roster/);
  assert.match(genesysHtml, /Meetings · demos · pipeline/);
  assert.match(genesysHtml, /Event system coverage/);
  assert.match(genesysHtml, /Conference tracker[\s\S]*Located/);
  assert.match(genesysHtml, /Events Drive[\s\S]*Setup needed/);
  assert.match(genesysHtml, /Measurement checkpoint/);
  assert.match(genesysHtml, /Primary objective[\s\S]*Not recorded as a governed field/);
  assert.match(genesysHtml, /Fully loaded cost[\s\S]*No normalized cost record/);
  assert.match(genesysHtml, /CRM association[\s\S]*Keyed Marketing Event · activity and deal joins pending/);
  assert.match(genesysHtml, /Open Marketing Event/);
  assert.match(genesysHtml, /Open measurement contract/);
  assert.match(genesysHtml, /Direct update · OOH meeting notes · Notion · Gmail · HubSpot · Restricted Genesys brief/);
  assert.match(genesysHtml, /href="\/sources">See source record/);
  assert.match(genesysHtml, /Guaranteed meetings<\/span><strong>None/);
  assert.match(genesysHtml, /Onsite footprint<\/span><strong>Booth confirmed/);
  assert.match(genesysHtml, /Swag \/ materials<\/span><strong>In plan · see event materials/);
  assert.doesNotMatch(genesysHtml, /Meetings scheduled/);
  assert.match(genesysHtml, /Team<\/span><strong>9 attending/);
  assert.match(genesysHtml, /Next move[\s\S]*Deliver the final solution-talk deck/);
  assert.match(genesysHtml, /Owner[\s\S]*Cat \+ Holden/);
  assert.match(genesysHtml, /Due[\s\S]*Aug 10/);
  assert.match(genesysHtml, /Status[\s\S]*In progress/);
  assert.match(genesysHtml, /Open task plan/);
  assert.doesNotMatch(genesysHtml, /Do these next/);
  assert.match(genesysHtml, /id="event-priorities"/);
  assert.match(genesysHtml, /Still needs attention\./);
  assert.match(genesysHtml, /6(?:<!-- -->)? event-specific/);
  assert.match(genesysHtml, /items are(?:<!-- -->)? still open in the current plan/);
  assert.match(genesysHtml, /Deliver Cat’s final solution-talk deck by Aug 10/);
  assert.match(genesysHtml, /href="\/marketing\?event=genesys-xperience#event-tasks"/);
  assert.match(genesysHtml, /Wish Line/);
  assert.match(genesysHtml, /Featured activation/);
  assert.match(genesysHtml, /Wish Line taxi campaign/);
  assert.match(genesysHtml, /0\.25-mile geofence · Bellagio to Fontainebleau · ~10-minute loop/);
  assert.match(genesysHtml, /AP confirmation pending/);
  assert.match(genesysHtml, /href="#workstream-marketing">Open route and viewing plan(?:<!-- -->)? ↓/);
  assert.match(genesysHtml, /shortest no-U-turn loop available/);
  assert.match(genesysHtml, /quarter-mile taxi geofence/);
  assert.match(genesysHtml, /Bellagio to Fontainebleau/);
  assert.match(genesysHtml, /estimated 10-minute loop/);
  assert.match(genesysHtml, /track a driver live/);
  assert.match(genesysHtml, /airport placement happens only if inventory is available/);
  assert.match(genesysHtml, /AP submitted payment/);
  for (const person of ["Cat", "Holden", "Matt", "Taylor", "Josh", "Carter", "Deepti", "Richard", "Lars"]) assert.match(genesysHtml, new RegExp(`>${person}<`));
  assert.doesNotMatch(genesysHtml, />Available</);
  assert.doesNotMatch(genesysHtml, /Final roster still needs to be reconciled/);
  assert.match(genesysHtml, /only external voice-AI partner in the current sponsor plan/);
  assert.match(genesysHtml, /Download the Cvent Events app now/);
  assert.match(genesysHtml, /Stanleys/);
  assert.match(genesysHtml, /Karaoke machines/);
  assert.match(genesysHtml, /Genesys sales rules \(confidential\)/);
  assert.match(genesysHtml, /Genesys trademark usage policy/);
  assert.match(genesysHtml, /referral agreement applies only if we are referring a prospect to Genesys/);
  assert.match(genesysHtml, /ask Cat or Holden/);
  assert.match(genesysHtml, /Open the restricted partner guidelines/);
  assert.match(genesysHtml, /Steak cards/);
  assert.doesNotMatch(genesysHtml, /Stick cards|MNHC|10 business days|Lead Registration Form/);
  assert.match(genesysHtml, /Do not pursue or register federal, state, local, or foreign government entities/);
  assert.match(genesysHtml, /Do not promise Genesys pricing, terms, product commitments, or approval/);
  assert.match(genesysHtml, /Aug 13/);
  assert.match(genesysHtml, /Travel and hotels should already be booked/);
  assert.match(genesysHtml, /Marketing tasks/);
  assert.match(genesysHtml, /8(?:<!-- -->)? of nine workstreams are in play/);
  assert.match(genesysHtml, /<strong>Navigate<\/strong>/);
  assert.match(genesysHtml, /<b>Event brief<\/b>[\s\S]*<b>Plan sections<\/b>[\s\S]*href="#workstream-marketing"[\s\S]*<b>Results \+ sources<\/b>/);
  assert.ok(genesysHtml.indexOf('href="#event-crew"') < genesysHtml.indexOf('href="#workstream-speaking"'));
  assert.ok(genesysHtml.indexOf('href="#workstream-budget"') < genesysHtml.indexOf('href="#event-changes"'));
  assert.match(genesysHtml, /<summary>Navigate this event(?:<!-- -->)? <span>[^<]+<\/span><\/summary>/);
  assert.match(genesysHtml, /id="workstream-marketing"/);
  assert.match(genesysHtml, /id="workstream-budget"/);
  assert.match(genesysHtml, /href="\/marketing\?event=genesys-xperience#event-tasks">Open workspace/);
  assert.match(genesysHtml, /href="\/marketing#measurement">Open measurement/);
  assert.doesNotMatch(genesysHtml, /id="workstream-secondary"/);
  assert.match(genesysHtml, /Not in this event plan[\s\S]*Secondary events[\s\S]*None/);

  const contact = await render("/events/contact-io");
  assert.equal(contact.status, 200);
  const contactHtml = await contact.text();
  assertSectionOrder(contactHtml, ["event-tldr", "event-no-plan", "event-writebacks", "event-update-route"]);
  assert.match(contactHtml, /Not attending/);
  assert.match(contactHtml, /Why there is no TeamSimple plan\./);
  assert.match(contactHtml, /Participation<\/span><strong>Not attending/);
  assert.match(contactHtml, /TeamSimple program<\/span><strong>None/);
  assert.match(contactHtml, /Nothing to prep for this event\./);
  assert.doesNotMatch(contactHtml, /id="event-prospecting"/);
  assert.doesNotMatch(contactHtml, /href="#event-prospecting">Prospecting/);
  assert.doesNotMatch(contactHtml, /Onsite footprint<\/span>/);
  assert.doesNotMatch(contactHtml, /Swag \/ materials<\/span>/);
  assert.doesNotMatch(contactHtml, /id="event-changes"/);
  assert.doesNotMatch(contactHtml, /id="event-priorities"/);
  assert.doesNotMatch(contactHtml, /class="event-next-move/);
  assert.doesNotMatch(contactHtml, /class="event-tldr-callout/);
  assert.doesNotMatch(contactHtml, /What needs to happen\./);
  assert.doesNotMatch(contactHtml, /Who’s going/);
  assert.doesNotMatch(contactHtml, /Measurement checkpoint/);
  assert.doesNotMatch(contactHtml, /id="event-role-routes"/);
  assert.match(contactHtml, /id="event-writebacks"/);
  assert.match(contactHtml, /Contact\.io participation/);
  assert.match(contactHtml, /gid=0&amp;range=A15:W15/);

  const trackerBaselineEvent = await render("/events/ccw-orlando");
  assert.equal(trackerBaselineEvent.status, 200);
  const trackerBaselineHtml = await trackerBaselineEvent.text();
  assert.match(trackerBaselineHtml, /Archived(?:<!-- -->)? · checked <time dateTime="2026-08-06">Aug 6, 2026<\/time>/);
  assert.match(trackerBaselineHtml, /<p>Conference tracker<small>/);
  assert.match(trackerBaselineHtml, /Notion setup needed/);
  assert.doesNotMatch(trackerBaselineHtml, /class="event-next-move/);

  const customerConnect = await render("/events/customer-connect-expo");
  assert.equal(customerConnect.status, 200);
  const customerConnectHtml = await customerConnect.text();
  assert.match(customerConnectHtml, /Confirmed/);
  assert.match(customerConnectHtml, /id="event-writebacks"/);
  assert.match(customerConnectHtml, /Customer Connect Expo participation/);
  assert.match(customerConnectHtml, /Customer Connect priorities · organizer call/);
  assert.match(customerConnectHtml, /Customer Connect task plan · organizer call/);
  assert.match(customerConnectHtml, /Customer Connect sponsorship workstream/);
  assert.match(customerConnectHtml, /gid=0&amp;range=A18:W18/);
  assert.match(customerConnectHtml, /Onsite footprint<\/span><strong>Booth confirmed/);
  assert.match(customerConnectHtml, /Swag \/ materials<\/span><strong>None/);
  assert.match(customerConnectHtml, /Four attendees and a 10×10 booth are planned/);
  assert.match(customerConnectHtml, /executed exhibition-space contract/);
  assert.match(customerConnectHtml, /Aug 11 at 9:30 AM PT/);
  assert.match(customerConnectHtml, /Insurance is recommended, not mandatory/);
  assert.match(customerConnectHtml, /25% complete on Aug 6/);
  assert.match(customerConnectHtml, /Next move[\s\S]*Confirm invoice payment status with AP/);
  assert.match(customerConnectHtml, /Owner[\s\S]*Holden \+ AP/);
  assert.match(customerConnectHtml, /Open task plan/);
  assert.match(customerConnectHtml, /Exhibitor portal/);
  assert.match(customerConnectHtml, /Complimentary tickets/);
  assert.match(customerConnectHtml, /6(?:<!-- -->)? of nine workstreams are in play/);
  assert.match(customerConnectHtml, /Open tracker(?:<!-- -->)? ↗/);
  assert.match(customerConnectHtml, /Open event project(?:<!-- -->)? ↗/);
  assert.match(customerConnectHtml, /Recorded Customer Connect portal progress/);
  assert.match(customerConnectHtml, /Confirmed Customer Connect Expo participation/);
  assert.match(customerConnectHtml, /Accepted Gabby Pring’s Customer Connect answers/);
  assert.match(customerConnectHtml, /id="workstream-marketing"/);
  assert.match(customerConnectHtml, /id="workstream-budget"/);
  assert.doesNotMatch(customerConnectHtml, /id="workstream-swag"/);

  const icmi = await render("/events/icmi-contact-center-expo");
  assert.equal(icmi.status, 200);
  const icmiHtml = await icmi.text();
  assert.match(icmiHtml, /TeamSimple is attending/);
  assert.match(icmiHtml, /Onsite footprint<\/span><strong>Under review/);
  assert.match(icmiHtml, /Speaking<\/span><strong>Lunch &amp; Learn · Wednesday · confirmation needs reconciliation/);
  assert.match(icmiHtml, /Open tracker(?:<!-- -->)? ↗/);

  const orlando = await render("/events/ccw-orlando");
  assert.equal(orlando.status, 200);
  const orlandoHtml = await orlando.text();
  assert.doesNotMatch(orlandoHtml, /Past event\. Booth presence is recorded/);
  assert.doesNotMatch(orlandoHtml, /id="event-priorities"/);
  assert.doesNotMatch(orlandoHtml, /id="event-role-routes"/);

  const vegas = await render("/events/ccw-vegas");
  assert.equal(vegas.status, 200);
  const vegasHtml = await vegas.text();
  assert.match(vegasHtml, /crm-snapshot/);
  assert.match(vegasHtml, /HubSpot/);
  assert.match(vegasHtml, /explicitly attributed deals/);
  assert.match(vegasHtml, /Demo completed/);
  assert.match(vegasHtml, /All 29 exactly attributed deals currently have \$0 amount/);
  assert.match(vegasHtml, /one source-only record and one detail-only record remain outside exact attribution/i);
  assert.match(vegasHtml, /Meetings recorded<\/span><strong>54/);
  assert.match(vegasHtml, /54 records in the CCW Vegas Meetings tab · 12 Booth · 20 Demo · 22 Intro/);
  assert.match(vegasHtml, /Demos recorded[\s\S]*20 rows labeled Demo in the meetings tracker/);
  assert.match(vegasHtml, /One Intro record is marked Canceled/);
  assert.match(vegasHtml, /All 54 outcome fields are blank/);
  assert.match(vegasHtml, /CCW Vegas meetings tracker/);
  assert.match(vegasHtml, /CCW Vegas meeting tracker reconciliation/);

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
  assert.match(orlando2027Html, /Meetings booked<\/span><strong>None recorded yet/);
  assert.match(orlando2027Html, /JW Marriott Bonnet Creek/);
  assert.match(orlando2027Html, /2027 conference tracker · Organizer site/);
  assert.match(orlando2027Html, /6 Executive Leadership Exchange meetings\. Get the matched-account list/);

  const uk2027 = await render("/events/ccw-uk-executive-exchange-2027");
  assert.equal(uk2027.status, 200);
  const uk2027Html = await uk2027.text();
  assert.match(uk2027Html, /March 2027 · exact dates TBD/);
  assert.match(uk2027Html, /Onsite footprint<\/span><strong>Meeting area confirmed/);
  assert.match(uk2027Html, /Keep the meeting area ready for scheduled conversations/);
  assert.doesNotMatch(uk2027Html, /Work the booth and nearby traffic/);
  assert.match(uk2027Html, /minimum 10 30-minute meetings/);
  assert.match(uk2027Html, /Meetings booked<\/span><strong>None recorded yet/);
  assert.match(uk2027Html, /3 sponsor passes · 2 attendees planned/);
  assert.match(uk2027Html, /Open tracker(?:<!-- -->)? ↗/);

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
  assert.match(chicagoHtml, /Past event/);
  assert.match(chicagoHtml, /Who is worth following up with\./);
  assert.match(chicagoHtml, /Who attended/);
  assert.match(chicagoHtml, /Recorded attendees/);
  assert.doesNotMatch(chicagoHtml, /Marked available/);
  assert.match(chicagoHtml, /What happened and what happens next\./);
  assert.match(chicagoHtml, /Closeout sections/);
  assert.match(chicagoHtml, /Plan and closeout/);
  assert.match(chicagoHtml, /What was planned—and what the record still needs\./);
  assert.match(chicagoHtml, /Plan language is intent unless the results below confirm the outcome\./);
  assert.match(chicagoHtml, /Event rating<\/span><strong>Negative/);
  assert.match(chicagoHtml, /Closeout<\/span><strong>Results recorded · see below/);
  assert.doesNotMatch(chicagoHtml, /Open workspace →/);
  assert.match(chicagoHtml, /Taylor was the sole TeamSimple attendee/);
  assert.match(chicagoHtml, /Josh did not attend/);
  assert.doesNotMatch(chicagoHtml, /Source check needed/);
  assert.match(chicagoHtml, /Archived(?:<!-- -->)? · checked <time dateTime="2026-08-07">Aug 7, 2026<\/time>/);
  assert.doesNotMatch(chicagoHtml, /Onsite check|Onsite gaps open|Open onsite priorities|Do these next/);
  assert.match(chicagoHtml, /Confirmed Taylor as the sole Chicago attendee/);
  assert.match(chicagoHtml, /1 attending/);
  assert.match(chicagoHtml, /Guaranteed meetings<\/span><strong>Included · count TBD/);
  assert.match(chicagoHtml, /Meetings recorded<\/span><strong>Not recorded/);
  assert.match(chicagoHtml, /Follow-up meetings<\/span><strong>2 booked · HubSpot details pending/);
  assert.match(chicagoHtml, /Follow-up meetings booked[\s\S]*2 scheduled · account, contact, date, owner, and outcome pending in HubSpot/);
  assert.match(chicagoHtml, /Negative · Taylor’s post-event feedback/);
  assert.match(chicagoHtml, /No opportunities are confirmed yet\./);
  assert.match(chicagoHtml, /contractual meeting amount may be 10, but it is not verified/);
  for (const account of ["Kemper", "Beyond Finance", "United Airlines", "CNA", "TransUnion", "Spot Hero"]) assert.match(chicagoHtml, new RegExp(account));
  assert.match(chicagoHtml, /CCW Exchange Chicago follow-up meetings/);
  assert.match(chicagoHtml, /do not mark either completed until it happens/);
  assert.match(chicagoHtml, /CCW Exchange Chicago cookie follow-up/);

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
