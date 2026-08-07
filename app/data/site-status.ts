export type SourceConnectionState = "Connected" | "Indirect";
export type SourceChangeState = "Applied" | "Needs review" | "No change";
export type SourceChange = {
  id: string;
  state: SourceChangeState;
  checkedAt: string;
  title: string;
  field: string;
  before: string;
  after: string;
  source: string;
  sourceUrl?: string;
  eventSlug?: string;
};
export type SourceOverride = {
  id: string;
  eventSlug: string;
  eventName: string;
  fieldKey: string;
  field: string;
  value: string;
  confirmedAt: string;
};

export const siteStatus = {
  contentUpdatedAt: "2026-08-07",
  contentUpdatedLabel: "Aug 07 · 2026",
  sourceMonitor: {
    automationState: "Active",
    cadence: "Daily · 9:00 AM PT",
    delivery: "Roundup posted in this Codex task",
    automationId: "event-fieldbook-source-scan",
    automationKind: "Codex heartbeat",
    automationVerifiedAt: "Aug 07 · 2026",
    connectionCheckedAt: "2026-08-06",
    connectionCheckedLabel: "Aug 06 · 2026",
    lastSuccessfulScan: "Aug 07, 2026 · 12:32 AM PT · HubSpot attribution refresh",
    lastSuccessfulScanMode: "Task review",
    protectedOverrides: [
      { id: "contact-io-participation", eventSlug: "contact-io", eventName: "Contact.io", fieldKey: "status", field: "Participation", value: "Not attending", confirmedAt: "Aug 06 · 2026" },
      { id: "customer-connect-participation", eventSlug: "customer-connect-expo", eventName: "Customer Connect Expo", fieldKey: "status", field: "Participation", value: "Confirmed", confirmedAt: "Aug 06 · 2026" },
      { id: "icmi-participation", eventSlug: "icmi-contact-center-expo", eventName: "ICMI Contact Center Expo", fieldKey: "status", field: "Participation", value: "Confirmed", confirmedAt: "Aug 06 · 2026" },
      { id: "genesys-roster", eventSlug: "genesys-xperience", eventName: "Genesys Xperience", fieldKey: "team", field: "Attendees", value: "Cat, Holden, Matt, Taylor, Josh, Carter, Deepti, Richard and Lars", confirmedAt: "Aug 06 · 2026" },
      { id: "genesys-meetings", eventSlug: "genesys-xperience", eventName: "Genesys Xperience", fieldKey: "guaranteedMeetings", field: "Guaranteed meetings", value: "None", confirmedAt: "Aug 06 · 2026" },
      { id: "vegas-2027-speaking-signal", eventSlug: "ccw-vegas-2027", eventName: "CCW Vegas 2027", fieldKey: "speaking", field: "Directory speaking signal", value: "1 speaking opportunity", confirmedAt: "Aug 06 · 2026" },
    ] as SourceOverride[],
    changeLog: [
      {
        id: "hubspot-ccw-source-mismatch",
        state: "Needs review" as SourceChangeState,
        checkedAt: "Aug 07 · 2026",
        title: "Reconcile one CCW deal-source mismatch",
        field: "Deal Source and Deal Source Detail",
        before: "30 deals carry the CCW Vegas follow-up detail",
        after: "29 also carry Event / Conference · Memorial Hermann carries Outbound — SDR and remains excluded",
        source: "HubSpot",
        sourceUrl: "https://app.hubspot.com/contacts/245561359/record/0-3/338921491147?utm_source=app_12360546_mcp&utm_medium=ai_agent&utm_campaign=event_fieldbook",
        eventSlug: "ccw-vegas",
      },
      {
        id: "hubspot-attribution-refresh-no-change",
        state: "No change" as SourceChangeState,
        checkedAt: "Aug 07 · 2026",
        title: "Exact CCW attribution baseline still holds",
        field: "Deals, meeting outcomes and Marketing Events",
        before: "29 exact deals · 4 possible event meetings · 0 completed outcomes · 0 Marketing Events",
        after: "No change to the publishable totals or stage distribution",
        source: "HubSpot",
        sourceUrl: "https://app.hubspot.com/contacts/245561359/objects/0-3/views/all/list?utm_source=app_12360546_mcp&utm_medium=ai_agent&utm_campaign=event_fieldbook",
        eventSlug: "ccw-vegas",
      },
      {
        id: "customer-connect-portal-registration",
        state: "Applied" as SourceChangeState,
        checkedAt: "Aug 06 · 2026",
        title: "Recorded Customer Connect portal progress",
        field: "Exhibitor setup",
        before: "Portal active · registration status and insurance requirements open",
        after: "Registration complete · insurance and pipe-and-drape requirements queued for the Aug 10 organizer call",
        source: "Organizer email · direct reply",
        sourceUrl: "https://mail.google.com/mail/#all/19fd9f287a45cfbe",
        eventSlug: "customer-connect-expo",
      },
      {
        id: "2027-program-added",
        state: "Applied" as SourceChangeState,
        checkedAt: "Aug 06 · 2026",
        title: "Added the 2027 event program",
        field: "Event directory",
        before: "26 events · 2026 only",
        after: "29 events · 2026–2027",
        source: "2027 conference tracker",
        sourceUrl: "https://docs.google.com/spreadsheets/d/1vDieEhNcLwWNFxrMQBQLCInhQTcPkspb-6glkSn44Fk/edit?gid=113603184#gid=113603184",
      },
      {
        id: "genesys-roster-confirmed",
        state: "Applied" as SourceChangeState,
        checkedAt: "Aug 06 · 2026",
        title: "Confirmed the Genesys Xperience roster",
        field: "Attendees",
        before: "Shorter tracker roster · Carter listed only as available",
        after: "9 attending · Cat, Holden, Matt, Taylor, Josh, Carter, Deepti, Richard and Lars",
        source: "Direct confirmation",
        eventSlug: "genesys-xperience",
      },
      {
        id: "genesys-email-deadline",
        state: "Applied" as SourceChangeState,
        checkedAt: "Aug 06 · 2026",
        title: "Updated the Genesys sponsor-email deadline",
        field: "Pre-event email",
        before: "Submission date still under review",
        after: "Due Aug 13 · Cat reviews, Holden submits",
        source: "Organizer email · Notion",
        eventSlug: "genesys-xperience",
      },
      {
        id: "customer-connect-confirmed",
        state: "Applied" as SourceChangeState,
        checkedAt: "Aug 06 · 2026",
        title: "Confirmed Customer Connect Expo participation",
        field: "Participation and sponsorship",
        before: "Decision pending",
        after: "Confirmed · executed contract · 10×10 booth · 4 attendees planned",
        source: "Direct decision · executed contract",
        eventSlug: "customer-connect-expo",
      },
      {
        id: "chicago-staffing-conflict",
        state: "Needs review" as SourceChangeState,
        checkedAt: "Aug 06 · 2026",
        title: "Resolve CCW Exchange Chicago staffing",
        field: "Attendees",
        before: "Tracker: Taylor confirmed · Josh available",
        after: "Notion and calendar: Taylor + Josh attending",
        source: "Conference tracker · Notion · calendar",
        eventSlug: "ccw-exchange-chicago",
      },
      {
        id: "travel-hospitality-staffing-conflict",
        state: "Needs review" as SourceChangeState,
        checkedAt: "Aug 06 · 2026",
        title: "Resolve CX Travel & Hospitality staffing",
        field: "Attendees",
        before: "Tracker: Taylor confirmed · Carter available",
        after: "Calendar: Zach + Taylor · Notion: 3 travelers unconfirmed",
        source: "Conference tracker · Notion · calendar",
        eventSlug: "iqpc-cx-travel-hospitality",
      },
      {
        id: "vegas-2027-workshop-date-conflict",
        state: "Needs review" as SourceChangeState,
        checkedAt: "Aug 06 · 2026",
        title: "Reconcile the CCW Vegas 2027 workshop date",
        field: "Speaking schedule",
        before: "Tracker: “Mon Jun 15”",
        after: "Calendar check: Jun 15, 2027 is Tuesday",
        source: "2027 conference tracker · calendar check",
        eventSlug: "ccw-vegas-2027",
      },
      {
        id: "slack-no-change",
        state: "No change" as SourceChangeState,
        checkedAt: "Aug 06 · 2026",
        title: "No new event decision found in Slack",
        field: "Event conversations",
        before: "Matching event messages checked",
        after: "No site change",
        source: "Slack",
      },
      {
        id: "hubspot-attribution-no-change",
        state: "No change" as SourceChangeState,
        checkedAt: "Aug 06 · 2026",
        title: "No new event attribution found outside CCW Vegas",
        field: "Deals and outcomes",
        before: "29 explicitly attributed event deals reviewed",
        after: "All 29 remain CCW Vegas · no attributable Genesys, Customer Connect, or Chicago record",
        source: "HubSpot",
        sourceUrl: "https://app.hubspot.com/contacts/245561359/objects/0-3/views/all/list",
      },
      {
        id: "genesys-meetings-upstream-aligned",
        state: "No change" as SourceChangeState,
        checkedAt: "Aug 06 · 2026",
        title: "Genesys guaranteed meetings already match",
        field: "Guaranteed meetings",
        before: "Fieldbook: None",
        after: "Tracker: No · no write-back required",
        source: "Google Sheets",
        sourceUrl: "https://docs.google.com/spreadsheets/d/1vDieEhNcLwWNFxrMQBQLCInhQTcPkspb-6glkSn44Fk/edit?gid=0&range=A16:R16",
        eventSlug: "genesys-xperience",
      },
    ] as SourceChange[],
    latestChecks: [
      {
        system: "HubSpot",
        checkedAt: "Aug 07 · 2026",
        scope: "CCW Vegas attribution refresh · 12:32 AM PT",
        result: "All 29 deals with the strict Event / Conference + CCW Vegas follow-up pair were re-read; the stage mix remains 5 meeting booked, 6 qualification, 8 demo completed, 2 validation, 4 closed lost and 4 disqualified. All 29 still have $0 amount and none is Closed Won. One additional deal carries the CCW detail with an Outbound — SDR source and stays excluded pending RevOps review. The full Jun 22–26 meeting window still contains eight records: four possible event meetings with no completed outcome and four unrelated calls. Marketing Events remains empty.",
      },
      {
        system: "Google Sheets · Notion · Gmail · Slack · Google Drive · HubSpot",
        checkedAt: "Aug 06 · 2026",
        scope: "Five-event freshness scan · 11:16 PM PT",
        result: "CCW Exchange Chicago, Genesys Xperience, CX Travel & Hospitality, Customer Connect Expo and CX Retail were rechecked across their available owner and signal sources. Customer Connect portal registration is complete; insurance and pipe-and-drape requirements remain open for the Aug 10 organizer call and the blank Notion project now has an exact write-back proposal. Genesys remains aligned on nine attendees, no guaranteed meetings and the Aug 13 email deadline. Slack, Drive and exact-name HubSpot meeting searches produced no additional publishable change.",
      },
      {
        system: "Google Sheets · Notion",
        checkedAt: "Aug 06 · 2026",
        scope: "Upstream write-back verification",
        result: "The tracker was re-read at the exact Contact.io, Genesys Xperience, Customer Connect Expo and ICMI rows. Four corrections remain: Contact.io participation, Customer Connect participation, ICMI participation and the Genesys roster. Genesys guaranteed meetings already says No and was removed from the write-back queue. The Events home and Genesys project in Notion were also re-read; both still contain the older source note or execution language shown in the queue.",
      },
      {
        system: "Google Sheets · organizer sites",
        checkedAt: "Aug 06 · 2026",
        scope: "2027 conference tracker · '2027'!A1:R4",
        result: "Three confirmed 2027 events were added: CCW Orlando, CCW UK Executive Exchange and CCW Vegas. The tracker supplies sponsorship, speaking, meeting-package and headcount details but no named attendees. Official organizer pages confirm Orlando on Jan 25–27 at JW Marriott Bonnet Creek and Las Vegas on Jun 14–17 at Caesars Forum. The UK Exchange exact March dates and venue remain open. The Vegas tracker’s “Mon Jun 15” workshop label conflicts with the 2027 calendar and is flagged for reconciliation.",
      },
      {
        system: "Google Sheets · Notion · Gmail · Slack · Google Drive · HubSpot",
        checkedAt: "Aug 06 · 2026",
        scope: "First end-to-end source baseline",
        result: "The scan reviewed 27 tracker rows, five active Notion projects, organizer mail received after Aug 5, matching Slack messages, the Events Drive folder and exact HubSpot event-source fields. Gmail supplied an Aug 13 Genesys email deadline and Customer Connect onboarding actions. Slack had no new matching event messages. Events Drive contained only the restricted Genesys rules brief. HubSpot contained 29 event-sourced deals, all explicitly attributed to CCW Vegas; none were attributable to Genesys Xperience, Customer Connect Expo or CCW Exchange Chicago.",
      },
      {
        system: "Notion · Slack · Gmail",
        checkedAt: "Aug 06 · 2026",
        scope: "Customer Connect Expo focused scan",
        result: "The participation decision remains confirmed. Gmail shows an executed exhibition-space contract, an active exhibitor portal, a 25%-complete company profile, an Aug 10 organizer onboarding call and a first-week request to publish the event/free-ticket link. Portal deadlines need reconciliation; the space-only date is Aug 17. The invoice was forwarded to AP, but payment status is not confirmed. Notion still lists four unnamed SDR attendees, and the booth number remains open.",
      },
      {
        system: "Google Sheets · Notion · Gmail · organizer site",
        checkedAt: "Aug 06 · 2026",
        scope: "IQPC CX Travel & Hospitality focused scan",
        result: "The tracker confirms Taylor and marks Carter available; a calendar record lists Zach + Taylor, while Notion says all three travelers still need confirmation. The tracker value remains and the conflict is in the approval queue. The official organizer page confirms Sep 8–9 at Hilton London Syon Park and an invitation-only format centered on pre-qualified one-to-one meetings and small-group discussion.",
      },
      {
        system: "Google Sheets · Notion · Slack · Gmail · HubSpot",
        checkedAt: "Aug 06 · 2026",
        scope: "CCW Exchange Chicago focused scan",
        result: "The tracker keeps Taylor confirmed and Josh available; Notion and the calendar record list Taylor + Josh. The tracker value remains on the site and the conflict is in the approval queue. A separate internal ICP sheet contains 28 researched accounts but is not the organizer’s meeting schedule. HubSpot returned no explicitly Chicago-attributed deal record, so no CRM outcome is published.",
      },
      {
        system: "Direct update · confidential agreement · Gmail · HubSpot",
        checkedAt: "Aug 06 · 2026",
        scope: "Genesys Xperience field brief and CRM check",
        result: "Holden confirmed the Wish Line media buy is approved, the phone number is purchased, the landing page and HubSpot campaign are live, the talk title/abstract/speaker are locked, and the final deck is due Aug 10. Organizer mail extended the contracted pre-event email deadline to Aug 13. The confidential referral agreement is represented only as operational guardrails and a link to the restricted brief; its commercial terms are not published. Exact HubSpot event-source fields contain no Genesys-attributed deal, and no matching meeting- or marketing-event record was found, so the event page does not publish a decorative outcome count.",
      },
      {
        system: "Direct decision",
        checkedAt: "Aug 06 · 2026",
        scope: "Genesys Xperience staffing",
        result: "The nine-person roster is confirmed: Cat, Holden, Matt, Taylor, Josh, Carter, Deepti, Richard and Lars. This direct decision replaces the shorter tracker list; Carter is no longer marked only as available.",
      },
      {
        system: "HubSpot",
        checkedAt: "Aug 06 · 2026",
        scope: "Deal, meeting and Marketing Event attribution audit",
        result: "29 of 29 exact event-sourced deals still resolve to CCW Vegas. HubSpot has no Marketing Event records. Eight meeting activities fell inside the CCW Vegas date window: four are possible on-site meetings and four are unrelated account calls. The four possible records have no completed outcome, so they remain a QA queue rather than a published meeting count.",
      },
      {
        system: "Google Sheets",
        checkedAt: "Aug 06 · 2026",
        scope: "2026 conference tracker · '2026'!A1:W30",
        result: "27 event rows reviewed. Staffing was reconciled for The Lead Summit, CCW Exchange Denver and CCW Exchange Chicago; Shoptalk Fall dates and inactive headcount were corrected. Direct decisions for Contact.io, Customer Connect Expo and ICMI remain in force while the tracker is updated.",
      },
    ],
    sources: [
      { name: "Conference tracker", system: "Google Sheets", state: "Connected" as SourceConnectionState, use: "Roster, dates, participation status and topline staffing", receipt: "5 near-term rows rechecked · Aug 6" },
      { name: "Active event projects", system: "Notion", state: "Connected" as SourceConnectionState, use: "Execution details, owners, deadlines and event-specific decisions", receipt: "5 active projects rechecked · Aug 6" },
      { name: "Events Drive", system: "Google Drive", state: "Connected" as SourceConnectionState, use: "Contracts, creative, attendee files and post-event artifacts", receipt: "1 restricted brief · no new file · Aug 6" },
      { name: "Event conversations", system: "Slack", state: "Connected" as SourceConnectionState, use: "New decisions and changes that still need to be checked against an authoritative source", receipt: "5 event searches · no match · Aug 6" },
      { name: "Organizer correspondence", system: "Gmail", state: "Connected" as SourceConnectionState, use: "Sponsor deliverables, deadlines, venue details and organizer changes", receipt: "2 event threads rechecked · 1 update · Aug 6" },
      { name: "Event-sourced outcomes", system: "HubSpot", state: "Connected" as SourceConnectionState, use: "Meetings, demos, deals and pipeline only when event attribution is clear", receipt: "29 exact deals · 1 source mismatch · Aug 7" },
      { name: "Conversation notes", system: "Granola", state: "Indirect" as SourceConnectionState, use: "Available only when a note is shared into a connected source", receipt: "No direct scan available" },
      { name: "Legacy event reporting", system: "Monaco", state: "Indirect" as SourceConnectionState, use: "Available only through exports or references shared into a connected source", receipt: "No direct scan available" },
    ],
  },
};

export function getEventSourceChanges(eventSlug: string) {
  return siteStatus.sourceMonitor.changeLog.filter((change) => change.eventSlug === eventSlug);
}
