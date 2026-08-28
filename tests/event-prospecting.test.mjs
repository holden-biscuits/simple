import test from "node:test";
import assert from "node:assert/strict";
import { events } from "../app/data/events.ts";
import { getEventProspectingBrief, hasExplicitProspectingProfile, prospectingTaxonomySource } from "../app/data/event-prospecting.ts";

test("every event has an explicit prospecting profile and ZoomInfo routes", () => {
  for (const event of events) {
    assert.equal(hasExplicitProspectingProfile(event.slug), true, `${event.slug} needs an explicit prospecting profile`);
    const brief = getEventProspectingBrief(event);
    assert.match(brief.zoomInfoCompanyUrl, /source=prospecting-company/);
    assert.match(brief.zoomInfoContactUrl, /source=prospecting-contact/);
    assert.ok(brief.companyFilters.length > 0);
    assert.ok(brief.contactFilters.length > 0);
  }
});

test("meeting-led and non-attending events do not imply HubSpot attendee segments", () => {
  for (const slug of ["demo-event-12", "demo-event-04", "demo-event-09", "demo-event-17", "demo-event-28", "demo-event-23"]) {
    const event = events.find((candidate) => candidate.slug === slug);
    assert.ok(event);
    const brief = getEventProspectingBrief(event);
    assert.equal(brief.hubspotStrategy, "zoominfo-only");
    assert.equal(brief.hubspotSegment, undefined);
    assert.deepEqual(brief.hubspotAccountLinks, []);
  }
});

test("verified event segments open live HubSpot contact views", () => {
  const ccw = getEventProspectingBrief(events.find((event) => event.slug === "demo-event-29"));
  const nice = getEventProspectingBrief(events.find((event) => event.slug === "demo-event-27"));
  assert.equal(ccw.hubspotSegment?.size, 608);
  assert.equal(ccw.hubspotSegment?.kind, "Static snapshot");
  assert.match(ccw.hubspotSegment?.url ?? "", /source=crm-segment&event=demo-event-29/);
  assert.equal(nice.hubspotSegment?.size, 254);
  assert.match(nice.hubspotSegment?.url ?? "", /source=crm-segment&event=demo-event-27/);
});

test("grounded named accounts get direct HubSpot contact searches", () => {
  const shoptalk = getEventProspectingBrief(events.find((event) => event.slug === "demo-event-19"));
  assert.equal(shoptalk.hubspotStrategy, "account-searches");
  assert.equal(shoptalk.hubspotAccountLinks[0]?.name, "Example Account 28");
  assert.match(shoptalk.hubspotAccountLinks[0]?.url ?? "", /source=crm-account%3AExample\+Account\+28/);
});

test("the prospecting contract uses recognizable ZoomInfo taxonomy", () => {
  assert.match(prospectingTaxonomySource, /industry/);
  assert.match(prospectingTaxonomySource, /technology products/);
  assert.match(prospectingTaxonomySource, /job function/);
  assert.match(prospectingTaxonomySource, /management level/);
});
