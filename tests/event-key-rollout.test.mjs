import test from "node:test";
import assert from "node:assert/strict";
import { eventKeyRollout } from "../app/data/source-governance.ts";

test("canonical Event key rollout covers every operating system", () => {
  assert.equal(new Set(eventKeyRollout.map((item) => item.system)).size, eventKeyRollout.length);
  assert.deepEqual(eventKeyRollout.filter((item) => item.state === "In use").map((item) => item.system), ["Event Basecamp", "HubSpot Marketing Events"]);
  for (const system of ["Google Sheets", "Notion", "HubSpot deals", "HubSpot meetings", "HubSpot Marketing Events", "Google Drive"]) {
    assert.ok(eventKeyRollout.some((item) => item.system === system), `${system} is missing from the rollout`);
  }
});
