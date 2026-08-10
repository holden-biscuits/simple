import assert from "node:assert/strict";
import test from "node:test";

import { eventCostPortfolio, getEventCostLedgers } from "../app/data/event-costs.ts";
import { events } from "../app/data/events.ts";

test("every participating event has a cost ledger without invented totals", () => {
  const ledgers = getEventCostLedgers();
  assert.equal(ledgers.length, events.filter((event) => event.status !== "No").length);
  assert.equal(new Set(ledgers.map((ledger) => ledger.eventSlug)).size, ledgers.length);
  assert.ok(ledgers.every((ledger) => ledger.lines.length > 0));
  assert.ok(ledgers.every((ledger) => /^https:\/\//.test(ledger.sourceUrl)));
  assert.equal(ledgers.reduce((total, ledger) => total + ledger.knownForecast, 0), 15000);
});

test("Genesys records the known Wish Line commitment and leaves missing costs explicit", () => {
  const ledger = getEventCostLedgers().find((item) => item.eventSlug === "genesys-xperience");
  assert.ok(ledger);
  assert.equal(ledger.knownForecast, 15000);
  assert.equal(ledger.knownFinal, 0);
  assert.ok(ledger.missingCount > 0);
  assert.deepEqual(ledger.lines.find((line) => line.category === "Paid media"), {
    category: "Paid media",
    detail: "Wish Line taxi campaign · approved purchase; AP confirmation pending",
    forecast: 15000,
    final: null,
    state: "Committed",
  });
});

test("commercial totals preserve blank HubSpot amounts instead of manufacturing pipeline", () => {
  const vegas = getEventCostLedgers().find((item) => item.eventSlug === "ccw-vegas");
  assert.ok(vegas);
  assert.equal(vegas.opportunities, 21);
  assert.equal(vegas.pipeline, null);
  assert.equal(vegas.revenue, 0);
  assert.equal(eventCostPortfolio.knownCommittedExpense, 15000);
  assert.equal(eventCostPortfolio.qualifyingOpportunities, 22);
  assert.equal(eventCostPortfolio.recordedPipeline, 0);
  assert.equal(eventCostPortfolio.recordedRevenue, 0);
  assert.equal(eventCostPortfolio.dealsWithoutAmount, 22);
});
