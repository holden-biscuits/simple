import assert from "node:assert/strict";
import test from "node:test";
import { eventBySlug, events } from "../app/data/events.ts";
import { getBriefIssueAction, getEventBriefReadiness, getEventPageBriefReadiness, getProgramBriefReadiness } from "../app/data/event-brief-readiness.ts";

const programDate = "2026-08-06";

test("brief readiness changes its requirements as an event approaches", () => {
  const genesys = getEventBriefReadiness(eventBySlug("genesys-xperience"), programDate);
  assert.equal(genesys.stage, "planning");
  assert.equal(genesys.timing, "26 days out");
  assert.deepEqual(genesys.issues.map((issue) => issue.key), ["execution-gaps"]);

  const customerConnect = getEventBriefReadiness(eventBySlug("customer-connect-expo"), programDate);
  assert.equal(customerConnect.stage, "planning");
  assert.ok(customerConnect.issues.some((issue) => issue.key === "roster"));
  assert.ok(customerConnect.issues.some((issue) => issue.key === "credentials"));
  assert.ok(customerConnect.issues.some((issue) => issue.key === "execution-gaps"));

  const travelExchange = getEventBriefReadiness(eventBySlug("iqpc-cx-travel-hospitality"), programDate);
  assert.ok(travelExchange.issues.some((issue) => issue.label === "Assign 2 remaining passes"));
});

test("brief readiness uses pass allocation instead of a larger planning estimate", () => {
  const vegas2027 = getEventBriefReadiness(eventBySlug("ccw-vegas-2027"), "2027-05-01");
  assert.ok(vegas2027.issues.some((issue) => issue.label === "Assign 9 remaining passes"));
  assert.ok(!vegas2027.issues.some((issue) => issue.label.includes("15")));
});

test("early-stage briefs require foundation facts without pretending final logistics are due", () => {
  const uk2027 = getEventBriefReadiness(eventBySlug("ccw-uk-executive-exchange-2027"), programDate);
  assert.equal(uk2027.stage, "foundation");
  assert.deepEqual(uk2027.issues.map((issue) => issue.key), ["dates", "workspace"]);
  assert.ok(!uk2027.issues.some((issue) => issue.key === "roster"));
  assert.ok(!uk2027.issues.some((issue) => issue.key === "venue"));
});

test("a confirmed foundation-stage event is not on track without an operating workspace", () => {
  const reuters = getEventBriefReadiness(eventBySlug("reuters-customer-service-east"), programDate);
  assert.equal(reuters.stage, "foundation");
  assert.equal(reuters.state, "attention");
  assert.equal(reuters.label, "Foundation gaps open");
  assert.deepEqual(reuters.issues.map((issue) => issue.key), ["workspace"]);
  assert.equal(reuters.issues[0].destination, "Event project");
});

test("current-event readiness drops roster warnings after a direct closeout correction", () => {
  const chicago = getEventBriefReadiness(eventBySlug("ccw-exchange-chicago"), programDate);
  assert.equal(chicago.stage, "onsite");
  assert.ok(!chicago.issues.some((issue) => issue.key === "source-conflict"));
  assert.ok(!chicago.issues.some((issue) => issue.key === "roster"));
  assert.ok(chicago.issues.some((issue) => issue.key === "venue"));
  assert.ok(chicago.issues.some((issue) => issue.key === "credentials"));
});

test("current event pages replace planning administration with onsite facts", () => {
  const chicago = getEventPageBriefReadiness(eventBySlug("ccw-exchange-chicago"), programDate);
  assert.equal(chicago.stage, "onsite");
  assert.ok(!chicago.issues.some((issue) => issue.label === "A source conflict still affects this brief"));
  assert.ok(!chicago.issues.some((issue) => issue.label.includes("attendee name")));
  assert.ok(chicago.issues.some((issue) => issue.label === "Venue details are not recorded"));
  assert.ok(chicago.issues.some((issue) => issue.label === "Pass and credential details are not recorded"));
  assert.ok(!chicago.issues.some((issue) => issue.key === "execution-plan"));
  assert.ok(!chicago.issues.some((issue) => issue.key === "execution-gaps"));
  assert.ok(!chicago.issues.some((issue) => issue.key === "workspace"));
});

test("program readiness excludes past and non-attending events", () => {
  const program = getProgramBriefReadiness(events, programDate);
  assert.equal(program.events.length, 14);
  assert.equal(program.ready.length + program.attention.length, 14);
  assert.equal(program.openInputs, program.events.reduce((total, event) => total + event.issues.length, 0));
});

test("every readiness destination resolves to the system that can fix it", () => {
  const customerConnect = eventBySlug("customer-connect-expo");
  assert.ok(customerConnect);
  assert.deepEqual(getBriefIssueAction({ key: "roster", label: "Name the roster", destination: "Conference tracker" }, customerConnect), {
    href: "https://docs.google.com/spreadsheets/d/1vDieEhNcLwWNFxrMQBQLCInhQTcPkspb-6glkSn44Fk/edit?gid=0#gid=0",
    label: "Open tracker",
    external: true,
  });
  assert.equal(getBriefIssueAction({ key: "workspace", label: "Open the project", destination: "Event project" }, customerConnect).href, customerConnect.notionUrl);
  assert.equal(getBriefIssueAction({ key: "venue", label: "Confirm the venue", destination: "Organizer source" }, customerConnect).href, customerConnect.organizerUrl);
  assert.deepEqual(getBriefIssueAction({ key: "conflict", label: "Resolve the conflict", destination: "Source review" }, customerConnect), {
    href: "/sources#approval-queue",
    label: "Open source review",
    external: false,
  });

  const uk2027 = eventBySlug("ccw-uk-executive-exchange-2027");
  assert.ok(uk2027);
  assert.equal(getBriefIssueAction({ key: "workspace", label: "Create the project", destination: "Event project" }, uk2027).label, "Open Notion setup");
});
