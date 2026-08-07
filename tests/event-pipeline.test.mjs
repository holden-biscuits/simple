import assert from "node:assert/strict";
import test from "node:test";

import { eventPipelineFilter, eventPipelineRefreshContract, eventPipelineSnapshot, summarizeEventPipeline } from "../app/data/event-pipeline.ts";

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

test("the refresh contract derives opportunity, pipeline and revenue totals from controlled HubSpot fields", () => {
  const summary = summarizeEventPipeline([
    { dealSource: "Event - Trade Show", dealStage: "appointmentscheduled", amountInHomeCurrency: "25000" },
    { dealSource: "Event - Field/Dinner", dealStage: "presentationscheduled", amountInHomeCurrency: "" },
    { dealSource: "Event / Conference", dealStage: "closedwon", amountInHomeCurrency: 12000 },
    { dealSource: "Event / Conference", dealStage: "closedlost", amountInHomeCurrency: 50000 },
    { dealSource: "Outbound - SDR", dealStage: "qualifiedtobuy", amountInHomeCurrency: 40000 },
  ]);

  assert.equal(summary.opportunities, 3);
  assert.equal(summary.openPipeline, 25000);
  assert.equal(summary.closedWonRevenue, 12000);
  assert.equal(summary.dealsWithoutAmount, 1);
  assert.deepEqual(summary.stages, [
    { label: "Meeting booked", count: 1 },
    { label: "Demo completed", count: 1 },
    { label: "Closed won", count: 1 },
  ]);
  assert.deepEqual(eventPipelineFilter.excludedStageValues, ["closedlost", "4028516043", "4040945398"]);
  assert.deepEqual(eventPipelineRefreshContract.properties, ["deal_source", "dealstage", "amount_in_home_currency"]);
});
