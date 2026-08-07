import assert from "node:assert/strict";
import test from "node:test";
import { classifyCrmAttribution, crmAttributionAudit } from "../app/data/crm-attribution.ts";

test("canonical event keys are explicit attribution", () => {
  const result = classifyCrmAttribution({ eventKey: "genesys-xperience", recordedEventKey: "genesys-xperience" });
  assert.equal(result.confidence, "explicit");
});

test("the controlled CCW deal detail resolves to the published event key", () => {
  const result = classifyCrmAttribution({
    eventKey: "ccw-vegas",
    dealSource: "Event / Conference",
    dealSourceDetail: "ccw_vegas_follow_up",
  });
  assert.equal(result.confidence, "explicit");
});

test("meeting text plus the event window still requires review", () => {
  const result = classifyCrmAttribution({
    eventKey: "ccw-vegas",
    activityText: "Meet at CCW Vegas booth 1340",
    eventAliases: ["CCW Vegas", "booth 1340"],
    withinEventWindow: true,
  });
  assert.equal(result.confidence, "needs-review");
});

test("date proximity and vendor mentions do not become outcomes", () => {
  const result = classifyCrmAttribution({
    eventKey: "genesys-xperience",
    activityText: "Genesys partner planning call",
    eventAliases: ["Genesys Xperience"],
    withinEventWindow: true,
  });
  assert.equal(result.confidence, "excluded");
});

test("the CRM audit keeps possible meetings out of completed results", () => {
  assert.equal(crmAttributionAudit.exactDeals, 29);
  assert.equal(crmAttributionAudit.meetingWindow.possibleEventMeetings, 4);
  assert.equal(crmAttributionAudit.meetingWindow.completedOutcomes, 0);
  assert.equal(crmAttributionAudit.marketingEvents, 0);
});
