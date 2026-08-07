import test from "node:test";
import assert from "node:assert/strict";
import { events } from "../app/data/events.ts";
import { getEventSystemLinkage, getProgramSystemLinkage } from "../app/data/system-linkage.ts";

test("program linkage reports only connections supported by governed records", () => {
  const linkage = getProgramSystemLinkage(events, "2026-08-06");
  assert.equal(linkage.totalEvents, 29);
  assert.equal(linkage.activeEvents, 14);
  assert.equal(linkage.stableFieldbookKeys, 29);
  assert.equal(linkage.trackerRowsLocated, 29);
  assert.equal(linkage.activeNotionProjects, 10);
  assert.equal(linkage.activeNotionMissing.length, 4);
  assert.equal(linkage.activeDriveFolders, 0);
  assert.equal(linkage.activeCrmEvents, 0);
  assert.equal(linkage.historicalCrmEvents, 1);
});

test("event linkage distinguishes a linked workspace from missing upstream setup", () => {
  const genesys = events.find((event) => event.slug === "genesys-xperience");
  const orlando = events.find((event) => event.slug === "ccw-orlando-2027");
  const contact = events.find((event) => event.slug === "contact-io");
  assert.ok(genesys);
  assert.ok(orlando);
  assert.ok(contact);
  assert.equal(getEventSystemLinkage(genesys).find((item) => item.system === "Notion")?.state, "Located");
  assert.equal(getEventSystemLinkage(orlando).find((item) => item.system === "Notion")?.state, "Setup needed");
  assert.equal(getEventSystemLinkage(genesys).find((item) => item.system === "HubSpot")?.state, "Setup needed");
  assert.deepEqual(getEventSystemLinkage(contact).map((item) => item.system), ["Conference tracker"]);
});
