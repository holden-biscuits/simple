import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("anchored navigation clears sticky chrome at each breakpoint", () => {
  assert.match(css, /--anchor-offset:\s*175px/);
  assert.match(css, /\.source-governance\[id\][\s\S]*scroll-margin-top:\s*var\(--anchor-offset\)/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*--anchor-offset:\s*96px[\s\S]*\.page-contents\s*\{\s*top:\s*0;/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*--anchor-offset:\s*24px/);
});

test("the program pulse keeps its hierarchy on tablet and mobile", () => {
  assert.match(css, /\.pulse-metrics\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*1fr\)/);
  assert.match(css, /\.pulse-layout\s*\{[^}]*grid-template-columns:\s*1\.35fr\s+\.9fr/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.pulse-layout\s*\{\s*grid-template-columns:\s*1fr;/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.pulse-metrics\s*\{\s*grid-template-columns:\s*1fr\s+1fr;/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.next-stops > div:last-child\s*\{\s*grid-template-columns:\s*1fr;/);
});
