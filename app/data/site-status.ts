export type SourceConnectionState = "Connected" | "Indirect";

export const siteStatus = {
  contentUpdatedAt: "2026-08-06",
  contentUpdatedLabel: "Aug 06 · 2026",
  sourceMonitor: {
    automationState: "Active",
    cadence: "Monday, Wednesday and Friday · 9:00 AM PT",
    delivery: "Roundup posted in this Codex task",
    connectionCheckedAt: "2026-08-06",
    connectionCheckedLabel: "Aug 06 · 2026",
    lastSuccessfulScan: null as null | string,
    latestChecks: [
      {
        system: "HubSpot",
        checkedAt: "Aug 06 · 2026",
        scope: "Deals with Deal Source = Event / Conference and Deal Source Detail = CCW Vegas follow-up",
        result: "29 of 29 matching records reviewed. Stage counts were added to CCW Vegas; pipeline value remains unpublished because every attributed deal currently has $0 amount.",
      },
    ],
    sources: [
      { name: "Conference tracker", system: "Google Sheets", state: "Connected" as SourceConnectionState, use: "Roster, dates, participation status and topline staffing" },
      { name: "Active event projects", system: "Notion", state: "Connected" as SourceConnectionState, use: "Execution details, owners, deadlines and event-specific decisions" },
      { name: "Events Drive", system: "Google Drive", state: "Connected" as SourceConnectionState, use: "Contracts, creative, attendee files and post-event artifacts" },
      { name: "Event conversations", system: "Slack", state: "Connected" as SourceConnectionState, use: "New decisions and changes that still need to be checked against an authoritative source" },
      { name: "Organizer correspondence", system: "Gmail", state: "Connected" as SourceConnectionState, use: "Sponsor deliverables, deadlines, venue details and organizer changes" },
      { name: "Event-sourced outcomes", system: "HubSpot", state: "Connected" as SourceConnectionState, use: "Meetings, demos, deals and pipeline only when event attribution is clear" },
      { name: "Conversation notes", system: "Granola", state: "Indirect" as SourceConnectionState, use: "Available only when a note is shared into a connected source" },
      { name: "Legacy event reporting", system: "Monaco", state: "Indirect" as SourceConnectionState, use: "Available only through exports or references shared into a connected source" },
    ],
  },
};
