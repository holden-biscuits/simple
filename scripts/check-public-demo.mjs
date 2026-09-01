import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const trackedFiles = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean)
  .filter((file) => !file.endsWith("package-lock.json"))
  .filter((file) => !/\.(?:png|jpe?g|gif|webp|ico|woff2?)$/i.test(file));

const literal = (...parts) => parts.join("");
const rules = [
  { label: "private CRM URL", pattern: new RegExp(literal("app.", "hubspot.com/contacts"), "i") },
  { label: "private Google document URL", pattern: new RegExp(literal("docs.", "google.com/"), "i") },
  { label: "private Google Drive URL", pattern: new RegExp(literal("drive.", "google.com/"), "i") },
  { label: "private Gmail URL", pattern: new RegExp(literal("mail.", "google.com/"), "i") },
  { label: "private Notion URL", pattern: new RegExp(literal("(?:app\\.)?", "notion\\.(?:so|com)/(?:p/)?[0-9a-f]{16,}"), "i") },
  { label: "numeric CRM identifier", pattern: /(?:portal|account|record)Id\s*[:=]\s*["']\d{8,}["']/i },
  { label: "email address", pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i },
  { label: "protected personal name", pattern: new RegExp(`\\b(?:${[
    literal("Hol", "den"), literal("Gab", "by Pr", "ing"), literal("Dee", "pti"), literal("Car", "ter"),
  ].join("|")})\\b`, "i") },
  { label: "known CRM account identifier", pattern: new RegExp(literal("245", "561", "359")) },
];

const findings = [];
for (const file of trackedFiles) {
  const contents = readFileSync(file, "utf8").replaceAll(
    literal("https://github.com/", "hol", "den-biscuits/simple"),
    "https://github.com/public-demo/repository",
  );
  for (const rule of rules) {
    const match = rule.pattern.exec(contents);
    if (!match) continue;
    const line = contents.slice(0, match.index).split("\n").length;
    findings.push(`${file}:${line} — ${rule.label}`);
  }
}

if (findings.length) {
  console.error("Public demo safety check failed:\n");
  for (const finding of findings) console.error(`- ${finding}`);
  console.error("\nReplace the value with a synthetic fixture or route it to /sources#public-demo.");
  process.exit(1);
}

console.log(`Public demo safety check passed (${trackedFiles.length} tracked text files scanned).`);
