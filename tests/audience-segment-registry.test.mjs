import test from "node:test";
import assert from "node:assert/strict";
import { audienceSegmentContract, getAudienceSegmentRegistry } from "../app/data/audience-segment-registry.ts";
import { events, getProgramDate } from "../app/data/events.ts";

const registry = getAudienceSegmentRegistry(events, getProgramDate());

test("the audience registry covers every active event without inventing live segments", () => {
  assert.equal(registry.activeEvents, 14);
  assert.equal(registry.specificationsReady, 7);
  assert.equal(registry.waitingForOrganizerAudience, 7);
  assert.equal(registry.automaticallyMaintained, 0);
  const activeKeys = events
    .filter((event) => event.status !== "No" && event.dateEndSort >= getProgramDate())
    .map((event) => event.slug);
  for (const eventKey of activeKeys) assert.ok(registry.items.some((item) => item.eventKey === eventKey), `${eventKey} needs a registry entry`);
});

test("existing HubSpot event lists stay labeled as static snapshots", () => {
  assert.equal(registry.verifiedSnapshots, 2);
  for (const eventKey of ["ccw-vegas", "nice-world"]) {
    const item = registry.items.find((candidate) => candidate.eventKey === eventKey);
    assert.equal(item?.state, "Verified static snapshot");
    assert.match(item?.membershipRule ?? "", /frozen/i);
    assert.match(item?.hubspotUrl ?? "", /objectLists\/(62|46)/);
  }
});

test("matched-account events wait for organizer evidence", () => {
  const chicago = registry.items.find((item) => item.eventKey === "ccw-exchange-chicago");
  assert.equal(chicago?.state, "Waiting for organizer audience");
  assert.match(chicago?.membershipRule ?? "", /organizer's matched-account or meeting file/i);
  assert.match(chicago?.refreshRule ?? "", /T\+90 days/);
});

test("segment membership separates targeting from attendance", () => {
  assert.equal(audienceSegmentContract.length, 4);
  assert.match(audienceSegmentContract[0].detail, /targeting—not proof of attendance/i);
  assert.match(audienceSegmentContract[1].detail, /event app.*organizer file.*booked meeting/i);
  assert.match(audienceSegmentContract[2].detail, /canonical Event key/i);
});

