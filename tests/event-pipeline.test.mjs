import assert from "node:assert/strict";
import test from "node:test";

import { eventPipelineFilter, eventPipelineRefreshContract, eventPipelineSnapshot, reconcileEventAttributionCoverage, summarizeEventPipeline } from "../app/data/event-pipeline.ts";

test("the HubSpot event pipeline snapshot reconciles its stage counts", () => {
  const staged = eventPipelineSnapshot.stages.reduce((total, stage) => total + stage.count, 0);
  assert.equal(staged, eventPipelineSnapshot.opportunities);
  assert.deepEqual(eventPipelineSnapshot.excludedStages, ["Closed Lost", "Disqualified"]);
  assert.deepEqual(eventPipelineSnapshot.sourceValues, ["Event — Trade Show", "Event — Field / Dinner", "Event / Conference"]);
  assert.equal(eventPipelineSnapshot.sourceEligibleRecords, 30);
  assert.equal(eventPipelineSnapshot.detailEligibleRecords, 30);
  assert.equal(eventPipelineSnapshot.exactAttributionRecords, 29);
  assert.equal(eventPipelineSnapshot.exactQualifyingOpportunities, 21);
  assert.equal(eventPipelineSnapshot.pairMismatchCount, 2);
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
  assert.deepEqual(eventPipelineRefreshContract.properties, ["deal_source", "deal_source_detail_standardized", "dealstage", "amount_in_home_currency"]);
  assert.match(eventPipelineRefreshContract.rule, /read the three controlled Deal Source values and every controlled Event detail independently/i);
});

test("source and detail coverage are reconciled independently before exact attribution", () => {
  const coverage = reconcileEventAttributionCoverage([
    { id: "exact", dealSource: "Event / Conference", dealSourceDetail: "ccw_vegas_follow_up" },
    { id: "source-only", dealSource: "Event - Trade Show", dealSourceDetail: "field_event_dinner" },
    { id: "detail-only", dealSource: "Outbound - SDR", dealSourceDetail: "ccw_vegas_follow_up" },
    { id: "unrelated", dealSource: "Outbound - SDR", dealSourceDetail: "outbound_sdr" },
  ]);

  assert.equal(coverage.sourceEligible.length, 2);
  assert.equal(coverage.detailEligible.length, 2);
  assert.equal(coverage.exact.length, 1);
  assert.equal(coverage.sourceOnly[0].id, "source-only");
  assert.equal(coverage.detailOnly[0].id, "detail-only");
});
