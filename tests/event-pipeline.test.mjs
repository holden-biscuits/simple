import assert from "node:assert/strict";
import test from "node:test";

import { eventPipelineSnapshot } from "../app/data/event-pipeline.ts";

test("the HubSpot event pipeline snapshot reconciles its stage counts", () => {
  const staged = eventPipelineSnapshot.stages.reduce((total, stage) => total + stage.count, 0);
  assert.equal(staged, eventPipelineSnapshot.opportunities);
  assert.deepEqual(eventPipelineSnapshot.excludedStages, ["Closed Lost", "Disqualified"]);
  assert.deepEqual(eventPipelineSnapshot.sourceValues, ["Event — Trade Show", "Event — Field / Dinner", "Event / Conference"]);
});

test("pipeline and revenue stay grounded in recorded deal amounts", () => {
  assert.equal(eventPipelineSnapshot.openPipeline, 0);
  assert.equal(eventPipelineSnapshot.closedWonRevenue, 0);
  assert.equal(eventPipelineSnapshot.dealsWithoutAmount, eventPipelineSnapshot.opportunities);
});
