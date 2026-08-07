import type { EventRecord } from "./events";

export type EventContractIssue = {
  eventKey: string;
  field: string;
  severity: "error" | "warning";
  message: string;
};

const eventKeyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string) {
  if (!isoDatePattern.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function getEventKey(event: Pick<EventRecord, "slug">) {
  return event.slug;
}

export function validateEventCatalog(catalog: EventRecord[]) {
  const issues: EventContractIssue[] = [];
  const seenKeys = new Set<string>();

  for (const event of catalog) {
    const eventKey = getEventKey(event);
    const add = (field: string, severity: EventContractIssue["severity"], message: string) => {
      issues.push({ eventKey, field, severity, message });
    };

    if (!eventKeyPattern.test(eventKey)) add("slug", "error", "Event key must be lowercase words separated by hyphens.");
    if (seenKeys.has(eventKey)) add("slug", "error", "Event key is duplicated.");
    seenKeys.add(eventKey);

    if (!event.name.trim()) add("name", "error", "Event name is required.");
    if (!event.dates.trim()) add("dates", "error", "Display dates are required.");
    if (!event.location.trim()) add("location", "error", "Location is required.");
    if (!isValidIsoDate(event.dateSort)) add("dateSort", "error", "Start date must be a real ISO date.");
    if (!isValidIsoDate(event.dateEndSort)) add("dateEndSort", "error", "End date must be a real ISO date.");
    if (isValidIsoDate(event.dateSort) && isValidIsoDate(event.dateEndSort) && event.dateEndSort < event.dateSort) {
      add("dateEndSort", "error", "End date cannot be earlier than start date.");
    }
    if (!isHttpsUrl(event.organizerUrl)) add("organizerUrl", "error", "Organizer URL must be a valid HTTPS URL.");
    if (event.notionUrl && !isHttpsUrl(event.notionUrl)) add("notionUrl", "error", "Notion URL must be a valid HTTPS URL.");
    event.relatedLinks?.forEach((link, index) => {
      if (!link.label.trim()) add(`relatedLinks.${index}.label`, "error", "Related links need a label.");
      if (!isHttpsUrl(link.url)) add(`relatedLinks.${index}.url`, "error", "Related links must use valid HTTPS URLs.");
    });

    if (event.attendeeCount !== null && (!Number.isInteger(event.attendeeCount) || event.attendeeCount < 0)) {
      add("attendeeCount", "error", "Attendee count must be a non-negative whole number or null.");
    }
    if (event.status === "No" && (event.team.length > 0 || (event.attendeeCount ?? 0) > 0)) {
      add("status", "error", "Events marked not attending cannot have an active roster.");
    }
    if (event.status !== "No" && event.attendeeCount !== null && event.team.length > event.attendeeCount) {
      add("team", "error", "Named attendees cannot exceed the planned attendee count.");
    }
    if (event.status !== "No" && (event.attendeeCount ?? 0) > 0 && event.team.length === 0) {
      add("team", "warning", "Attendee count is known, but the roster is not named.");
    }
    if (event.notes.toLowerCase().startsWith("source conflict:")) {
      add("notes", "warning", "An authoritative source conflict still needs a decision.");
    }
  }

  return issues;
}

export function getEventCatalogHealth(catalog: EventRecord[]) {
  const issues = validateEventCatalog(catalog);
  return {
    eventKeys: new Set(catalog.map(getEventKey)).size,
    errors: issues.filter((issue) => issue.severity === "error"),
    warnings: issues.filter((issue) => issue.severity === "warning"),
    unnamedRosters: issues.filter((issue) => issue.field === "team" && issue.severity === "warning").length,
    sourceConflicts: issues.filter((issue) => issue.field === "notes" && issue.severity === "warning").length,
  };
}
