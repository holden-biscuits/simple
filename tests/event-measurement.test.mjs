import test from "node:test";
import assert from "node:assert/strict";
import { getEventMeasurementCheckpoint, measurementFields, measurementReadiness, measurementWindows, metricDefinitions } from "../app/data/event-measurement.ts";

test("the event measurement contract has one owner and timing rule for every required record", () => {
  assert.equal(measurementFields.length, 6);
  assert.equal(new Set(measurementFields.map((item) => item.field)).size, measurementFields.length);
  for (const item of measurementFields) {
    assert.ok(item.owner);
    assert.ok(item.timing);
    assert.ok(item.rule);
  }
  assert.match(measurementFields.find((item) => item.field === "Fully loaded cost")?.rule ?? "", /sponsorship.*travel.*production.*paid media.*activation.*freight/i);
});

test("reporting windows extend through the commercial follow-up period", () => {
  assert.equal(measurementWindows.length, 6);
  assert.equal(measurementWindows.at(-1)?.window, "30 and 90 days after");
  assert.match(measurementWindows.at(-1)?.output ?? "", /sourced pipeline.*influenced pipeline.*closed revenue/i);
});

test("metric definitions keep activity, sourced pipeline and influence distinct", () => {
  const held = metricDefinitions.find((item) => item.metric === "Held meeting");
  const sourced = metricDefinitions.find((item) => item.metric === "Sourced pipeline");
  const influenced = metricDefinitions.find((item) => item.metric === "Influenced pipeline");
  assert.match(held?.definition ?? "", /Scheduled, blank-outcome and no-show records do not count/);
  assert.match(sourced?.definition ?? "", /created the first qualified opportunity/);
  assert.match(influenced?.definition ?? "", /pre-existing opportunity/);
  assert.equal(metricDefinitions.find((item) => item.metric === "Meeting-to-opportunity rate")?.formula, "Event-sourced opportunities ÷ held meetings");
  assert.equal(measurementReadiness.portfolioRoiReady, false);
});

test("event checkpoints show missing measurement inputs without turning them into zero", () => {
  const upcoming = getEventMeasurementCheckpoint({ meetingsBooked: [], meetingCountLabel: "5" }, "upcoming");
  assert.equal(upcoming.objective, "Not recorded as a governed field");
  assert.equal(upcoming.cost, "No normalized cost record");
  assert.equal(upcoming.crm, "Exact Event key join missing");
  assert.equal(upcoming.meetings, "5 meeting records · account names missing");
  assert.match(upcoming.nextAction, /before spend or promotion/);

  const historical = getEventMeasurementCheckpoint({ meetingsBooked: ["Account A"], crmSnapshot: {} }, "past");
  assert.equal(historical.crm, "Controlled legacy join");
  assert.equal(historical.meetings, "1 account recorded");
  assert.match(historical.nextAction, /30 and 90 days/);
});
