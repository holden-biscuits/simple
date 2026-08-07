import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("anchored navigation clears sticky chrome at each breakpoint", () => {
  assert.match(css, /--anchor-offset:\s*175px/);
  assert.match(css, /\.source-governance\[id\][\s\S]*scroll-margin-top:\s*var\(--anchor-offset\)/);
  assert.match(css, /\.scan-contract\[id\]/);
  assert.match(css, /\.operating-roadmap\[id\]/);
  assert.match(css, /\.crm-activation\[id\]/);
  assert.match(css, /\.event-recent-changes\[id\]/);
  assert.match(css, /\.event-role-routes\[id\]/);
  assert.match(css, /\.leadership-changes\[id\]/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*--anchor-offset:\s*96px[\s\S]*\.page-contents\s*\{\s*top:\s*0;/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*--anchor-offset:\s*24px/);
});

test("the program pulse keeps its hierarchy on tablet and mobile", () => {
  assert.match(css, /\.pulse-metrics\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*1fr\)/);
  assert.match(css, /\.pulse-layout\s*\{[^}]*grid-template-columns:\s*1\.35fr\s+\.9fr/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.pulse-layout\s*\{\s*grid-template-columns:\s*1fr;/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.pulse-metrics\s*\{\s*grid-template-columns:\s*1fr\s+1fr;/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.next-stops > div:last-child\s*\{\s*grid-template-columns:\s*1fr;/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.pulse-readiness\s*\{\s*grid-template-columns:\s*1fr;/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.freshness-policy-grid\s*\{\s*grid-template-columns:\s*1fr 1fr/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.freshness-policy-grid\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.audience-views\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.leadership-table\s*\{\s*min-width:\s*0;\s*display:\s*block/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.leadership-risk-grid[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.leadership-change-columns\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.leadership-change-summary[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.event-update-route-grid\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.event-role-route-grid\s*\{\s*grid-template-columns:\s*1fr 1fr/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.event-role-route-grid\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.event-key-example\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.linkage-coverage, \.event-linkage-strip, \.linkage-gap-list\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(css, /\.stewardship-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*1fr\)/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.stewardship-grid, \.leadership-queue-grid\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(css, /\.measurement-windows > div:last-child\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*1fr\)/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.measurement-windows > div:last-child, \.metric-definitions > div:last-child\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(css, /\.event-measurement-checkpoint > div\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*1fr\)/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.event-measurement-checkpoint > div\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(css, /\.not-found-hero\s*\{[^}]*grid-template-columns:\s*\.8fr 1\.2fr/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.not-found-hero\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.not-found-routes\s*\{\s*grid-template-columns:\s*1fr/);
});

test("the CRM attribution audit remains readable below desktop", () => {
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.crm-health-grid\s*\{\s*grid-template-columns:\s*1fr 1fr/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.crm-rule-grid, \.crm-operating-model\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.crm-health-grid, \.crm-rule-grid, \.crm-operating-model\s*\{\s*grid-template-columns:\s*1fr/);
});

test("essential interface text has a durable readability floor", () => {
  const floor = css.slice(css.indexOf("Essential interface type floor"));
  assert.match(floor, /\.attention-next small[\s\S]*font-size:\s*11\.5px/);
  assert.match(floor, /\.leadership-table td small[\s\S]*font-size:\s*11\.5px/);
  assert.match(floor, /\.event-measurement-checkpoint > div span[\s\S]*font-size:\s*11\.5px/);
  assert.match(floor, /\.directory-filter-set button[\s\S]*font-size:\s*12px/);
  assert.match(floor, /\.search-quick button[\s\S]*font-size:\s*12px/);
  assert.match(floor, /\.event-update-route-grid b[\s\S]*font-size:\s*12px/);
  assert.match(css, /\.event-change > header[^}]*11\.5px/);
  assert.match(css, /\.event-change footer[^}]*11\.5px/);
  assert.match(css, /\.event-role-route-grid header[^}]*11\.5px/);
  assert.match(css, /\.event-role-route-grid p[^}]*15px/);
  assert.match(css, /\.leadership-change-list dt[^}]*11\.5px/);
  assert.match(css, /\.leadership-change-list dd[^}]*14px/);
});
