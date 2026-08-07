import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../app/components/page-contents-links.tsx", import.meta.url), "utf8");

test("side navigation tracks the current section and keeps the state accessible", () => {
  assert.match(source, /window\.addEventListener\("scroll", scheduleUpdate, \{ passive: true \}\)/);
  assert.match(source, /getBoundingClientRect\(\)\.top <= threshold/);
  assert.match(source, /aria-current=\{activeId === item\.id \? "location" : undefined\}/);
});

test("using the mobile contents menu closes it after a section is chosen", () => {
  assert.match(source, /closest\("details"\)/);
  assert.match(source, /details\.open = false/);
});
