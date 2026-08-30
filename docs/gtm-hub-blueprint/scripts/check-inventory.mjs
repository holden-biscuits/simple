#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const inventoryPath = process.argv[2];
if (!inventoryPath) {
  console.error("Usage: node scripts/check-inventory.mjs <inventory.csv>");
  process.exit(2);
}

const text = await readFile(inventoryPath, "utf8");
const lines = text.trim().split(/\r?\n/);
const headers = parseCsvLine(lines.shift() ?? "");
const requiredHeaders = [
  "source_drive_path",
  "source_item_id",
  "publish_status",
  "destination_slug",
  "owner",
  "reviewer",
  "last_reviewed",
  "review_due",
  "sensitivity",
];

const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
if (missingHeaders.length) {
  console.error(`Missing required columns: ${missingHeaders.join(", ")}`);
  process.exit(1);
}

const rows = lines.filter(Boolean).map((line, index) => {
  const values = parseCsvLine(line);
  return Object.fromEntries(headers.map((header, column) => [header, values[column] ?? ""]));
});

const errors = [];
const slugs = new Map();

rows.forEach((row, index) => {
  const line = index + 2;
  if (!row.source_drive_path) errors.push(`line ${line}: missing source_drive_path`);
  if (!['approved', 'hold', 'blocked'].includes(row.publish_status)) errors.push(`line ${line}: invalid publish_status`);
  if (!['public', 'internal', 'restricted', 'blocked'].includes(row.sensitivity)) errors.push(`line ${line}: invalid sensitivity`);

  if (row.publish_status === "approved") {
    for (const field of ["source_item_id", "destination_slug", "owner", "reviewer", "last_reviewed", "review_due"]) {
      if (!row[field]) errors.push(`line ${line}: approved row missing ${field}`);
    }
  }

  if (row.destination_slug) {
    const prior = slugs.get(row.destination_slug);
    if (prior) errors.push(`line ${line}: duplicate destination_slug also used on line ${prior}`);
    else slugs.set(row.destination_slug, line);
  }
});

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const counts = rows.reduce((result, row) => {
  result[row.publish_status] = (result[row.publish_status] ?? 0) + 1;
  return result;
}, {});

console.log(`Inventory valid: ${rows.length} rows`);
console.log(`Status counts: ${Object.entries(counts).map(([key, value]) => `${key}=${value}`).join(", ")}`);

function parseCsvLine(line) {
  const result = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      result.push(value);
      value = "";
    } else {
      value += character;
    }
  }
  result.push(value);
  return result;
}

