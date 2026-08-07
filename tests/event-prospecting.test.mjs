import test from "node:test";
import assert from "node:assert/strict";
import { events } from "../app/data/events.ts";
import { getEventProspectingBrief, hasExplicitProspectingProfile, prospectingTaxonomySource } from "../app/data/event-prospecting.ts";

test("every event has an explicit prospecting profile and ZoomInfo routes", () => {
  for (const event of events) {
    assert.equal(hasExplicitProspectingProfile(event.slug), true, `${event.slug} needs an explicit prospecting profile`);
    const brief = getEventProspectingBrief(event);
    assert.match(brief.zoomInfoCompanyUrl, /zoominfo\.com\/.*company/);
    assert.match(brief.zoomInfoContactUrl, /zoominfo\.com\/.*person/);
    assert.ok(brief.companyFilters.length > 0);
    assert.ok(brief.contactFilters.length > 0);
  }
});

test("meeting-led and non-attending events do not imply HubSpot attendee segments", () => {
  for (const slug of ["ccw-exchange-chicago", "ccw-cxo-exchange-charlotte", "iqpc-cx-retail-atlanta", "consero-cx-forum", "contact-io", "shoptalk-fall"]) {
    const event = events.find((candidate) => candidate.slug === slug);
    assert.ok(event);
    const brief = getEventProspectingBrief(event);
    assert.equal(brief.hubspotStrategy, "zoominfo-only");
    assert.equal(brief.hubspotSegment, undefined);
    assert.deepEqual(brief.hubspotAccountLinks, []);
  }
});

test("verified event segments open live HubSpot contact views", () => {
  const ccw = getEventProspectingBrief(events.find((event) => event.slug === "ccw-vegas"));
  const nice = getEventProspectingBrief(events.find((event) => event.slug === "nice-world"));
  assert.equal(ccw.hubspotSegment?.size, 608);
  assert.equal(ccw.hubspotSegment?.kind, "Static snapshot");
  assert.match(ccw.hubspotSegment?.url ?? "", /objectLists\/62/);
  assert.equal(nice.hubspotSegment?.size, 254);
  assert.match(nice.hubspotSegment?.url ?? "", /objectLists\/46/);
});

test("grounded named accounts get direct HubSpot contact searches", () => {
  const shoptalk = getEventProspectingBrief(events.find((event) => event.slug === "shoptalk-spring"));
  assert.equal(shoptalk.hubspotStrategy, "account-searches");
  assert.equal(shoptalk.hubspotAccountLinks[0]?.name, "PetLab Co");
  assert.match(shoptalk.hubspotAccountLinks[0]?.url ?? "", /objects\/0-1\/views\/all\/list\?query=PetLab%20Co/);
});

test("the prospecting contract uses recognizable ZoomInfo taxonomy", () => {
  assert.match(prospectingTaxonomySource, /industry/);
  assert.match(prospectingTaxonomySource, /technology products/);
  assert.match(prospectingTaxonomySource, /job function/);
  assert.match(prospectingTaxonomySource, /management level/);
});
