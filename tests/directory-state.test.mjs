import assert from "node:assert/strict";
import test from "node:test";
import { getEventDetailHref, getEventDirectoryHref, getSafeEventReturnHref, parseEventDirectoryState } from "../app/data/directory-state.ts";

const years = ["2026", "2027"];

test("directory state is bounded and serializes into a shareable event view", () => {
  const state = parseEventDirectoryState({ q: " Genesys ", attendance: "going", attention: "source", year: "2027" }, years);
  assert.deepEqual(state, { query: "Genesys", attendance: "going", attention: "source", year: "2027" });
  assert.equal(getEventDirectoryHref(state), "/?q=Genesys&attendance=going&attention=source&year=2027#events");
  assert.equal(getEventDetailHref("genesys-xperience", state), "/events/genesys-xperience?returnTo=%2F%3Fq%3DGenesys%26attendance%3Dgoing%26attention%3Dsource%26year%3D2027%23events");
});

test("invalid filters fall back to the full directory", () => {
  const state = parseEventDirectoryState({ attendance: "maybe", attention: "urgent", year: "2030" }, years);
  assert.deepEqual(state, { query: "", attendance: "all", attention: "all", year: "all" });
  assert.equal(getEventDirectoryHref(state), "/#events");
  assert.equal(getEventDetailHref("genesys-xperience", state), "/events/genesys-xperience");
});

test("the closeout queue is a shareable directory view", () => {
  const state = parseEventDirectoryState({ attendance: "going", attention: "closeout", year: "2026" }, years);
  assert.deepEqual(state, { query: "", attendance: "going", attention: "closeout", year: "2026" });
  assert.equal(getEventDirectoryHref(state), "/?attendance=going&attention=closeout&year=2026#events");
  assert.equal(getSafeEventReturnHref("/?attendance=going&attention=closeout&year=2026#events"), "/?attendance=going&attention=closeout&year=2026#events");
});

test("event return links cannot leave the fieldbook or target another route", () => {
  assert.equal(getSafeEventReturnHref("/?q=Genesys&attendance=going#events"), "/?q=Genesys&attendance=going#events");
  assert.equal(getSafeEventReturnHref("/?attention=source&year=2026#events"), "/?attention=source&year=2026#events");
  assert.equal(getSafeEventReturnHref("https://evil.example/#events"), "/#events");
  assert.equal(getSafeEventReturnHref("/marketing#events"), "/#events");
  assert.equal(getSafeEventReturnHref("/?admin=true#events"), "/#events");
});
