import { hasGuaranteedMeetingPackage } from "./event-signals.ts";
import { publicDemo } from "./demo-mode.ts";

export type EventPhase = "past" | "now" | "upcoming";
export type ActivationStatus = "Confirmed" | "Under review" | "None";

export type EventVerification = {
  checkedAt: string;
  checkedAtISO: string;
  sources: string[];
};

export type WorkstreamKey =
  | "speaking"
  | "sponsorship"
  | "meetings"
  | "swag"
  | "secondary"
  | "travel"
  | "marketing"
  | "followup"
  | "budget";

export type MarketingTask = {
  title: string;
  status: "Open" | "In progress" | "Ready for review" | "Done";
  due?: string;
  dueSort?: string;
  owner?: string;
  note?: string;
  url?: string;
};

export type EventTldrCallout = {
  label: string;
  title: string;
  detail: string;
  goal: string;
  salesAction: string;
  href?: string;
  action?: string;
};

export type EventRecord = {
  slug: string;
  name: string;
  dates: string;
  dateSort: string;
  dateEndSort: string;
  completedAt?: string;
  location: string;
  status: "Confirmed" | "TBD" | "Tentative" | "No";
  speaking: string;
  speakingStatus?: ActivationStatus;
  sponsorship: string;
  sponsorshipStatus?: ActivationStatus;
  guaranteedMeetings: string;
  attendeeCount: number | null;
  team: string[];
  available: string[];
  notes: string;
  rating: string;
  meetingsBooked: string[];
  followupMeetingsBooked?: number;
  demosBooked: string[];
  closed: string[];
  organizerUrl: string;
  notionUrl?: string;
  venue?: string;
  credentials?: string;
  tldrCallout?: EventTldrCallout;
  specialConsiderations?: string[];
  priorityActions?: string[];
  marketingTasks?: MarketingTask[];
  relatedLinks?: { label: string; url: string }[];
  meetingCountLabel?: string;
  meetingRecordSummary?: string;
  demoCountLabel?: string;
  outcomeNotes?: string[];
  crmSnapshot?: {
    system: "HubSpot";
    checkedAt: string;
    attribution: string;
    totalDeals: number;
    stages: { label: string; count: number }[];
    dataQualityNote: string;
    url: string;
  };
  workstreams?: Partial<Record<WorkstreamKey, string[]>>;
};

export const sourceLinks = {
  sheet:
    "/sources?source=tracker#public-demo",
  ccwPlan:
    "/sources?source=event-plan#public-demo",
  notion:
    "/sources?source=projects#public-demo",
  eventsDrive:
    "/sources?source=assets#public-demo",
  hubspot:
    "/sources?source=crm#public-demo",
};

export const events: EventRecord[] = [
  {
    slug: "demo-event-26",
    name: "Harbor CX Forum",
    dates: "Jan 21–23, 2026",
    dateSort: "2026-01-21",
    dateEndSort: "2026-01-23",
    location: "Orlando, FL",
    status: "Confirmed",
    speaking: "None",
    sponsorship: "Booth 314",
    guaranteedMeetings: "None listed",
    attendeeCount: null,
    team: ["Avery", "Casey"],
    available: [],
    notes: "",
    rating: "None",
    meetingsBooked: ["Example Account 26", "Example Account 38", "Example Account 39", "Example Account 47", "Example Account 56", "Example Account 27", "Example Account 40"],
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
  },
  {
    slug: "demo-event-08",
    name: "Pacific Service Exchange",
    dates: "Feb 4–6, 2026",
    dateSort: "2026-02-04",
    dateEndSort: "2026-02-06",
    location: "San Diego, CA",
    status: "Confirmed",
    speaking: "Speaking slot on Feb 5",
    sponsorship: "Emerging Tech participation",
    guaranteedMeetings: "None listed",
    attendeeCount: null,
    team: ["Avery"],
    available: [],
    notes: "",
    rating: "None",
    meetingsBooked: [],
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
  },
  {
    slug: "demo-event-10",
    name: "Beacon Women in Business Forum",
    dates: "Feb 7, 2026",
    dateSort: "2026-02-07",
    dateEndSort: "2026-02-07",
    location: "Boston, MA",
    status: "Confirmed",
    speaking: "Panel",
    sponsorship: "None",
    guaranteedMeetings: "None",
    attendeeCount: null,
    team: ["Avery"],
    available: [],
    notes: "",
    rating: "None",
    meetingsBooked: [],
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
  },
  {
    slug: "demo-event-13",
    name: "Lone Star CX Exchange",
    dates: "Mar 3–6, 2026",
    dateSort: "2026-03-03",
    dateEndSort: "2026-03-06",
    location: "Austin, TX",
    status: "Confirmed",
    speaking: "None",
    sponsorship: "Booth 14",
    guaranteedMeetings: "None listed",
    attendeeCount: null,
    team: ["Avery", "Casey"],
    available: [],
    notes: "",
    rating: "None",
    meetingsBooked: ["Example Account 10", "Example Account 06"],
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
  },
  {
    slug: "demo-event-19",
    name: "MarketFlow Spring",
    dates: "Mar 23–26, 2026",
    dateSort: "2026-03-23",
    dateEndSort: "2026-03-26",
    location: "Las Vegas, NV",
    status: "Confirmed",
    speaking: "None",
    sponsorship: "Booth 484 · first-time sponsor",
    guaranteedMeetings: "None listed",
    attendeeCount: null,
    team: ["Casey"],
    available: [],
    notes: "First-time sponsor with booth 484. The tracker records meetings with Example Account 28 and Example Account 22.",
    rating: "None",
    meetingsBooked: ["Example Account 28", "Example Account 22"],
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
  },
  {
    slug: "demo-event-04",
    name: "Executive Experience Forum",
    dates: "May 13–15, 2026",
    dateSort: "2026-05-13",
    dateEndSort: "2026-05-15",
    location: "Charlotte, NC",
    status: "Confirmed",
    speaking: "None",
    sponsorship: "None listed",
    guaranteedMeetings: "Yes",
    attendeeCount: 2,
    team: ["Riley"],
    available: [],
    notes: "",
    rating: "None",
    meetingsBooked: ["Example Account 57", "Example Account 19", "Example Account 09", "Example Account 48"],
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
  },
  {
    slug: "demo-event-20",
    name: "Retail Growth Summit",
    dates: "May 20–21, 2026",
    dateSort: "2026-05-20",
    dateEndSort: "2026-05-21",
    location: "New York, NY",
    status: "Confirmed",
    speaking: "None",
    sponsorship: "None",
    guaranteedMeetings: "None",
    attendeeCount: 3,
    team: ["Riley", "Casey"],
    available: [],
    notes: "The tracker rates this event as a poor fit.",
    rating: "Bad",
    meetingsBooked: ["Example Account 51", "Example Account 41", "Example Account 14", "Example Account 42", "Example Account 43", "Example Account 44", "Example Account 15", "Example Account 49", "Example Account 29"],
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
  },
  {
    slug: "demo-event-27",
    name: "Service Platform World",
    dates: "Jun 8–10, 2026",
    dateSort: "2026-06-08",
    dateEndSort: "2026-06-10",
    location: "Orlando, FL",
    status: "Confirmed",
    speaking: "None",
    sponsorship: "None",
    guaranteedMeetings: "None",
    attendeeCount: 3,
    team: ["Morgan", "Riley", "Casey"],
    available: [],
    notes: "",
    rating: "Good",
    meetingsBooked: ["Example Account 02", "Example Account 16", "Example Account 30", "Example Account 20", "Example Account 01", "Example Account 50", "Example Account 11", "Example Account 34", "Example Account 07", "Example Account 52", "Example Account 23", "Example Account 35", "Example Account 17", "Example Account 31", "Example Account 08", "Example Account 21"],
    demosBooked: ["Example Account 24", "Example Account 53", "Example Account 34", "Example Account 36", "Example Account 30", "Example Account 01", "Example Account 12"],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
  },
  {
    slug: "demo-event-29",
    name: "Customer Operations Week",
    dates: "Jun 22–26, 2026",
    dateSort: "2026-06-22",
    dateEndSort: "2026-06-26",
    location: "Las Vegas, NV",
    status: "Confirmed",
    speaking: "45-minute fireside chat · Avery + Cameron",
    sponsorship: "Booth, backdrop, lead capture, raffle, swag and VIP activations",
    guaranteedMeetings: "Yes",
    attendeeCount: 5,
    team: ["Avery", "Morgan", "Riley", "Casey"],
    available: [],
    notes: "Reference event for the shared checklist and lead-handling rules.",
    rating: "None",
    meetingsBooked: [],
    meetingCountLabel: "54",
    meetingRecordSummary: "54 records in the Customer Operations Week Meetings tab · 12 Booth · 20 Demo · 22 Intro",
    demosBooked: [],
    demoCountLabel: "20",
    outcomeNotes: [
      "The Meetings tab records 54 Customer Operations Week follow-up activities: 12 Booth, 20 Demo, and 22 Intro.",
      "One Intro record is marked Canceled. The other 53 status fields are blank, so the sheet does not prove that every scheduled activity happened.",
      "All 54 outcome fields are blank; five rows are marked as additional touchpoints rather than net-new activity.",
    ],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
    relatedLinks: [
      { label: "Customer Operations Week meetings tracker", url: "/sources#public-demo" },
    ],
    crmSnapshot: {
      system: "HubSpot",
      checkedAt: "Aug 7, 2026",
      attribution: "Deal Source: Event / Conference · Deal Source Detail: Customer Operations Week follow-up",
      totalDeals: 29,
      stages: [
        { label: "Meeting booked", count: 5 },
        { label: "Qualification", count: 6 },
        { label: "Demo completed", count: 8 },
        { label: "Validation", count: 2 },
        { label: "Closed lost", count: 4 },
        { label: "Disqualified", count: 4 },
      ],
      dataQualityNote: "All 29 exactly attributed deals currently have $0 amount, so the CRM does not yet support a pipeline-value claim. No attributed deal is marked Closed Won. One source-only record and one detail-only record remain outside exact attribution pending RevOps review.",
      url: "/sources#public-demo",
    },
    workstreams: {
      speaking: ["Fireside chat with Avery and Cameron", "Drive engaged contacts to the session and help them add it to their calendar"],
      sponsorship: ["Booth and backdrop", "Klik lead capture", "Raffle poster and QR workflow"],
      meetings: ["Guaranteed meetings", "Capture booth, dinner, party, session, raffle and sponsor-data contacts"],
      swag: ["Low: stickers or gummies", "Mid: karaoke item after a real conversation", "High: Omaha Steaks voucher after demo/contact capture"],
      secondary: ["Welcome party", "Private dinner", "VIP experiences"],
      travel: ["Registration, travel and booth staffing plan"],
      marketing: ["Session promotion", "Personalized VIP demos", "Event collateral and QR assets"],
      followup: ["Reconcile all lead sources", "Tier contacts 1–4", "Set the HubSpot event attribution to Demo CX 2026", "Set SDR attribution to Casey and assign one owner and next action"],
      budget: ["Track sponsorship, shipping, swag, raffle and secondary-event costs"],
    },
  },
  {
    slug: "demo-event-15",
    name: "Retail Experience UK",
    dates: "Jul 1–2, 2026",
    dateSort: "2026-07-01",
    dateEndSort: "2026-07-02",
    location: "London, UK",
    status: "Confirmed",
    speaking: "30-minute plenary · Parker",
    sponsorship: "None listed",
    guaranteedMeetings: "Yes · count not recorded",
    attendeeCount: 3,
    team: ["Parker", "Riley"],
    available: [],
    notes: "The tracker reports 10–15 meetings, many unqualified, and five named demos.",
    rating: "None",
    meetingsBooked: [],
    meetingCountLabel: "10–15",
    demosBooked: ["Example Account 32", "Example Account 37", "Example Account 03", "Example Account 33", "Example Account 04"],
    outcomeNotes: ["The tracker says 10–15 meetings and notes that many were unqualified."],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
  },
  {
    slug: "demo-event-14",
    name: "Mountain CX Exchange",
    dates: "Jul 15–17, 2026",
    dateSort: "2026-07-15",
    dateEndSort: "2026-07-17",
    location: "Denver, CO",
    status: "Confirmed",
    speaking: "10-minute quickfire · Morgan",
    sponsorship: "25-item seat drop",
    guaranteedMeetings: "Yes",
    attendeeCount: 2,
    team: ["Morgan", "Quinn"],
    available: [],
    notes: "The tracker rates this event Great and records nine named meetings from the quickfire and seat-drop package.",
    rating: "Great",
    meetingsBooked: ["Example Account 05", "Example Account 45", "Example Account 13", "Example Account 25", "Example Account 46", "Example Account 54", "Example Account 55", "Example Account 19", "Example Account 18"],
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
  },
  {
    slug: "demo-event-21",
    name: "Operations Leadership Summit",
    dates: "Jul 22, 2026",
    dateSort: "2026-07-22",
    dateEndSort: "2026-07-22",
    location: "New York, NY",
    status: "Confirmed",
    speaking: "40-minute fireside · Avery + Cameron",
    sponsorship: "None listed",
    guaranteedMeetings: "None listed",
    attendeeCount: 4,
    team: ["Avery", "Morgan", "Quinn"],
    available: [],
    notes: "Four people attended the 40-minute fireside. Meeting and demo outcomes have not been added to the tracker.",
    rating: "None",
    meetingsBooked: [],
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
  },
  {
    slug: "demo-event-12",
    name: "Midwest CX Exchange",
    dates: "Aug 5–7, 2026",
    dateSort: "2026-08-05",
    dateEndSort: "2026-08-07",
    completedAt: "2026-08-07",
    location: "Chicago, IL",
    status: "Confirmed",
    speaking: "10-minute quickfire · Riley",
    sponsorship: "No expo booth; confirm seat drop and materials",
    sponsorshipStatus: "Under review",
    guaranteedMeetings: "Yes",
    attendeeCount: 1,
    team: ["Riley"],
    available: [],
    notes: "Final attendance confirmed by Jordan after the event: Riley was the sole TeamSimple attendee; Casey did not attend.",
    rating: "Negative · Riley’s post-event feedback",
    meetingsBooked: [],
    followupMeetingsBooked: 2,
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
    notionUrl: "/sources#public-demo",
    outcomeNotes: [
      "Riley reported negative overall feedback after the event.",
      "Two follow-up meetings are scheduled; account, contact, date, owner, and outcome are not yet recorded in HubSpot.",
      "No opportunities are confirmed yet.",
      "The contractual meeting amount may be 10, but it is not verified in the owning source.",
      "Riley is coordinating cookie deliveries to Kemper, Beyond Finance, United Airlines, CNA, TransUnion, and Spot Hero.",
    ],
    workstreams: {
      speaking: ["10-minute quickfire with Riley; final delivery details have not been added to the closeout"],
      sponsorship: ["No expo booth", "Final seat-drop or materials fulfillment has not been recorded"],
      meetings: ["Two post-event follow-up meetings are scheduled; account, contact, date, owner, and outcome still need to be recorded in HubSpot", "The contractual meeting amount may be 10, but it is not verified in the owning source", "Do not count either scheduled follow-up as held or as an opportunity until HubSpot records the outcome"],
      swag: ["Only organizer-approved one-pagers or leave-behinds were in plan; final use is not recorded"],
      secondary: ["None"],
      travel: ["Riley was the sole TeamSimple attendee", "Casey did not attend"],
      marketing: ["Capture Riley’s negative feedback and decide what would need to change before repeating this format"],
      followup: ["Riley is coordinating cookie deliveries to Kemper, Beyond Finance, United Airlines, CNA, TransUnion, and Spot Hero", "For each delivery, record the recipient, reason, delivery status, conversation outcome, owner, and next step", "Use the ready-to-go gifting plan for future account drops instead of rebuilding the process event by event"],
      budget: ["Verify the contractual meeting amount and reconcile the final event expenses", "Record the cookie-delivery cost and approved gifting budget"],
    },
  },
  {
    slug: "demo-event-28",
    name: "Contact Makers Summit",
    dates: "Aug 23–25, 2026",
    dateSort: "2026-08-23",
    dateEndSort: "2026-08-25",
    location: "Denver, CO",
    status: "No",
    speaking: "None",
    sponsorship: "None",
    guaranteedMeetings: "No",
    attendeeCount: 0,
    team: [],
    available: [],
    notes: "TeamSimple is not attending.",
    rating: "None",
    meetingsBooked: [],
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
    venue: "Hyatt Regency Denver at Colorado Convention Center",
    workstreams: {
      speaking: ["None"],
      sponsorship: ["None"],
      meetings: ["None"],
      swag: ["None"],
      secondary: ["None"],
      travel: ["None"],
      marketing: ["None"],
      followup: ["None"],
      budget: ["None"],
    },
  },
  {
    slug: "demo-event-16",
    name: "Partner Experience Summit",
    dates: "Sep 1–3, 2026",
    dateSort: "2026-09-01",
    dateEndSort: "2026-09-03",
    location: "Las Vegas, NV",
    status: "Confirmed",
    speaking: "20-minute solution talk · Sep 3 at 1:10 PM",
    sponsorship: "Booth package + contracted pre-event email + approved $15K Wish Line taxi campaign",
    guaranteedMeetings: "No",
    attendeeCount: 9,
    team: ["Avery", "Jordan", "Morgan", "Riley", "Casey", "Quinn", "Sam", "Drew", "Alex"],
    available: [],
    notes: "The only external voice-AI partner in the current sponsor plan. The opportunity depends on Partner Platform-account targeting, the event app, Avery’s talk, the booth, and direct outreach.",
    rating: "None",
    meetingsBooked: [],
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
    notionUrl: "/sources#public-demo",
    venue: "Wynn Las Vegas · Orchestrators Hall",
    credentials: "9 booth passes",
    tldrCallout: {
      label: "Wish Line FYI",
      title: "1-855-955-WISH",
      detail: "Live Simple agent · Aug 31–Sep 3",
      goal: "Turn the Vegas campaign into a live product demo and bring qualified conference callers to the booth.",
      salesAction: "Ask prospects to call it; if they engage, continue the conversation at the booth and record the next step.",
      href: "/sources#public-demo",
      action: "Open the campaign brief",
    },
    priorityActions: [
      "Deliver Avery’s final solution-talk deck by Aug 10, then schedule rehearsal and confirm AV.",
      "Submit the contracted pre-event email copy by Aug 13: Avery reviews, then Jordan sends it through the sponsor portal.",
      "Complete the final QA pass on the demo landing page; the HubSpot form, campaign attribution, and 15-minute demo CTA are already in place.",
      "Release the approved Wish Line activation once AP confirms payment; the condensed route, quarter-mile geofence, and bonus spot-based placement are set.",
      "Produce the booth-monitor product video, using demo-environment screen recordings if that is the fastest credible route.",
      "Lock the post-event lead list, tiering, ownership, and follow-up workflow before the team arrives.",
    ],
    marketingTasks: [
      { title: "Deliver the final solution-talk deck", status: "In progress", due: "Aug 10", dueSort: "2026-08-10", owner: "Avery + Jordan", note: "Title, abstract, and speaker are locked. Avery has the source material; Jordan will remind and unblock.", url: "/sources#public-demo" },
      { title: "Move Wish Line into creative production", status: "In progress", due: "Starts week of Aug 10", dueSort: "2026-08-10", owner: "Jordan", note: "$15K campaign and phone number are approved. AP submitted payment and Example Account 45 is waiting for confirmation. The no-U-turn loop, quarter-mile taxi geofence, and bonus spot-based placement are set.", url: "/sources#public-demo" },
      { title: "Submit the contracted pre-event email copy", status: "In progress", due: "Aug 13", dueSort: "2026-08-13", owner: "Jordan + Avery", note: "The organizer extended the deadline and the portal task is live. Avery reviews; Jordan submits.", url: "/sources#public-demo" },
      { title: "Final QA for the Partner Summit landing page", status: "Ready for review", owner: "Marketing", note: "HubSpot form, campaign attribution, and 15-minute demo CTA are already live.", url: "/sources#public-demo" },
      { title: "Produce the booth-monitor product video", status: "Open", due: "Date and owner open", note: "Critical onsite asset. Decide whether to build it from demo-environment screen recordings." },
      { title: "Build the post-event lead and follow-up workspace", status: "Open", due: "Before Sep 1", dueSort: "2026-08-31", owner: "Marketing + RevOps", note: "Use the Customer Operations Week model: one lead list, tiered follow-up, named owners, and HubSpot QA." },
      { title: "Reconcile contracted deliverables and spend", status: "In progress", due: "Before Sep 1", dueSort: "2026-08-31", owner: "Marketing", note: "Track the booth, email add-on, Wish Line, production, shipping, and materials on the marketing page—not the field brief." },
    ],
    relatedLinks: [
      { label: "Official agenda", url: "/sources#public-demo" },
      { label: "Partner Summit landing page", url: "/sources#public-demo" },
      { label: "Partner Platform sales rules (confidential)", url: "/sources#public-demo" },
      { label: "Partner Platform trademark usage policy", url: "/sources#public-demo" },
    ],
    specialConsiderations: [
      "Avery’s 20-minute solution talk is Thursday, Sep 3 at 1:10 PM. Know where it is, invite priority prospects, and use it to continue conversations at the booth.",
      "Position Simple AI as an enhancement to the Partner Platform environment—not a replacement for Partner Platform Cloud CX. Never imply that we can bind Partner Platform or that we are an exclusive Partner Platform partner.",
      "Simple AI is the only external voice-AI partner in the current sponsor plan besides Partner Platform’ own product. Use that as an event differentiator, then recheck the final sponsor roster before making the claim publicly.",
      "Target Partner Platform accounts. Ask which Partner Platform product they run, which call types matter, monthly volume, current failure points, and who owns the contact-center roadmap.",
      "The referral agreement applies only if we are referring a prospect to Partner Platform—a situation we do not expect to be common at this event. Read the restricted partner guidelines before sharing contact details or submitting a referral. If you are unsure how to handle a prospect, ask Avery or Jordan.",
      "Do not promise Partner Platform pricing, terms, product commitments, or approval on Partner Platform’ behalf. Use only approved Partner Platform marks and partner language.",
      "We have 4–5 rolling duffels for bringing swag and materials to Las Vegas. Coordinate who carries each bag before departure.",
    ],
    workstreams: {
      speaking: ["20-minute solution talk on Sep 3 at 1:10 PM", "Title, abstract, and speaker are locked", "Final deck is due Aug 10; rehearse and confirm AV after the handoff"],
      sponsorship: ["Booth confirmed in Orchestrators Hall", "Use the live Partner Summit page for the 15-minute demo CTA and HubSpot capture"],
      meetings: ["Build conversations through the Cvent Events app, Avery’s talk, the booth, and direct outreach", "Use attendee names to target Partner Platform accounts", "Introduce yourself in the app, move promising contacts into direct outreach, and add every booked meeting to HubSpot with the required context", "If a conversation genuinely requires a Partner Platform referral, stop and ask Avery or Jordan before sharing contact details"],
      swag: ["Stanleys", "Steak cards", "Printed handouts", "Karaoke machines", "Ship materials to the designated recipients, then have the team bring them to Las Vegas in large bags"],
      secondary: ["None"],
      travel: ["Event venue: Wynn Las Vegas", "Travel and hotels should already be booked for all nine attendees", "Do not over-engineer booth shifts: avoid crowding the space, keep enough coverage, and send teammates into the event to bring priority contacts back to the booth"],
      marketing: ["Wish Line uses the shortest no-U-turn loop available inside a quarter-mile taxi geofence, covering roughly Bellagio to Fontainebleau; the north Strip is intentional", "Plan around an estimated 10-minute loop, with traffic as the variable", "Example Account 45 is the single point of contact and can track a driver live if Jordan or the CEO wants a specific viewing time", "Spot-based network impressions are a bonus; airport placement happens only if inventory is available", "See the Partner Experience Summit tab on the marketing page for email, landing page, Wish Line, talk deck, booth video, follow-up, and budget tasks"],
      followup: ["Add booked meetings and meaningful conversations to HubSpot before the day ends", "Marketing can bulk-import badge scans; manually log card-only contacts so they do not disappear", "Use the Customer Operations Week model: one lead list, tiered follow-up, a named owner, and one concrete next step"],
      budget: ["The $15K Wish Line campaign is approved", "AP submitted payment; Example Account 45 is waiting for confirmation", "Airport placement is not included in the purchase and must stay out of the committed-media total", "See the Partner Experience Summit tab on the marketing page for the full spend and production record"],
    },
  },
  {
    slug: "demo-event-05",
    name: "Travel & Hospitality CX Forum",
    dates: "Sep 8–9, 2026",
    dateSort: "2026-09-08",
    dateEndSort: "2026-09-09",
    location: "London, UK",
    status: "Confirmed",
    speaking: "30-minute plenary",
    sponsorship: "None listed",
    guaranteedMeetings: "Yes",
    attendeeCount: 3,
    team: ["Riley"],
    available: ["Quinn"],
    notes: "Source conflict: The conference tracker confirms Riley, marks Quinn available, and leaves Parker blank. The calendar record lists Parker + Riley, while Notion says the three travelers are still unconfirmed. Keep Riley as the only confirmed attendee until the tracker is reconciled.",
    rating: "None",
    meetingsBooked: [],
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
    notionUrl: "/sources#public-demo",
    venue: "Hilton London Syon Park",
    specialConsiderations: [
      "The organizer describes this as an invitation-only Exchange built around pre-qualified one-to-one meetings, interactive roundtables, and small-group discussions. Prepare for the matched conversations; there is no expo-floor motion to fall back on.",
      "The audience is senior CX, guest experience, loyalty, and digital leadership across travel, hospitality, and leisure. Ground the plenary and account briefs in connected guest journeys, operational complexity, and helping customers reach the right channel at the right time.",
      "This begins five days after Partner Experience Summit. Vegas travel, London travel, speaking production, and materials need one handoff plan.",
    ],
    priorityActions: [
      "Confirm the three travelers and determine who, if anyone, is traveling directly from Partner Platform in Las Vegas.",
      "Confirm the guaranteed-meeting count and format; get the matched-account list from Demo Organizer.",
      "Confirm the speaker and title, then build the plenary around externally safe proof points for connected guest journeys, operational complexity, and channel routing.",
      "Select a London printer for leave-behinds instead of shipping materials through customs.",
    ],
    marketingTasks: [
      { title: "Confirm speaker and finalize title/abstract with Demo Organizer", status: "Open" },
      { title: "Build the plenary deck and complete the Pre-Publish Gate", status: "Open" },
      { title: "Tailor proof points to travel and hospitality", status: "Open", note: "Use the published Omaha numbers as the externally safe proof points." },
      { title: "Complete the AV check and rehearsal", status: "Open" },
      { title: "Confirm the meeting count and format; get the matched-account list", status: "Open" },
      { title: "Research each matched account and prepare talking points", status: "Open" },
      { title: "Log booked meetings and demos in HubSpot with the required context", status: "Open" },
      { title: "Select a London print vendor and produce materials locally", status: "Open" },
      { title: "Decide whether to host a client dinner with matched prospects and UK accounts", status: "Open" },
      { title: "Confirm the three travelers and register their passes", status: "Open" },
      { title: "Book flights and hotel; identify who is traveling from Las Vegas", status: "Open" },
      { title: "Publish a LinkedIn post ahead of the plenary", status: "Open" },
      { title: "Run outreach to UK travel and hospitality prospects with one CTA", status: "Open" },
      { title: "Send personal follow-up within one week of the event", status: "Open", due: "Sep 16 · within one week", dueSort: "2026-09-16" },
      { title: "Debrief; update the event rating in the tracker and verify meetings and demos in HubSpot", status: "Open" },
    ],
    workstreams: {
      speaking: ["30-minute plenary", "Confirm speaker and title/abstract with Demo Organizer", "Frame the session for senior travel and hospitality leaders around connected guest journeys, operational complexity, and channel routing", "Use the published Omaha numbers as the externally safe proof points", "Build deck, complete the Pre-Publish Gate, rehearse, and confirm AV"],
      sponsorship: ["None"],
      meetings: ["The organizer describes pre-qualified one-to-one meetings; package count and format are not yet confirmed", "Get the matched-account list and prepare one brief per meeting", "Log meetings and demos in HubSpot"],
      swag: ["Print required materials in the UK; select a London vendor"],
      secondary: ["Optional client dinner with matched prospects and UK accounts; none confirmed"],
      travel: ["Confirm three travelers and register passes", "Book flights and hotel; check whether anyone is traveling directly from Las Vegas"],
      marketing: ["LinkedIn post ahead of the plenary", "Targeted outreach to UK travel and hospitality prospects with one CTA"],
      followup: ["Send personal follow-up within the week", "Debrief, then update rating, meetings, and demos in the tracker"],
      budget: ["Track travel and local-print costs"],
    },
  },
  {
    slug: "demo-event-11",
    name: "Customer Connect Showcase",
    dates: "Sep 9–10, 2026",
    dateSort: "2026-09-09",
    dateEndSort: "2026-09-10",
    location: "Atlanta, GA",
    status: "Confirmed",
    speaking: "None",
    sponsorship: "10×10 booth",
    guaranteedMeetings: "No",
    attendeeCount: 4,
    team: [],
    available: [],
    notes: "Confirmed with an executed exhibition-space contract. Four attendees and a 10×10 booth are planned; attendee names remain open. Booth 505 is recorded in Notion. Portal registration is complete; the exhibitor profile was 25% complete on Aug 6. AP processed the payment and expects it to settle during the week of Aug 11.",
    rating: "None",
    meetingsBooked: [],
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
    notionUrl: "/sources#public-demo",
    venue: "Georgia World Congress Center",
    relatedLinks: [
      { label: "Exhibitor portal", url: "/sources#public-demo" },
      { label: "Complimentary tickets", url: "/sources#public-demo" },
    ],
    priorityActions: [
      "Name the four attendees and assign booth coverage, lead-capture, travel, and follow-up owners. Notion currently says only “SDRs TBD.”",
      "Use the organizer onboarding call on Aug 11 at 9:30 AM PT to confirm the remaining booth 505 package inclusions, lead retrieval, power, furniture, signage, and shipping. Notion now confirms insurance is not needed for our pipe-and-drape booth.",
      "Complete the exhibitor portal company profile and add the event/free-ticket link to the Simple website within the organizer’s first-week window.",
      "Save the executed contract and exhibitor guide in the Events Drive, then confirm the AP payment has settled during the week of Aug 11.",
      "Get the event app onto every attendee’s phone, build the target list, and start pre-booking directly.",
    ],
    marketingTasks: [
      { title: "Confirm the AP payment has settled", status: "In progress", due: "Week of Aug 11", dueSort: "2026-08-11", owner: "Jordan + AP", note: "Notion records that AP processed the payment and expects it to go through during the week of Aug 11. Confirm settlement." },
      { title: "Use the organizer onboarding call to close booth logistics", status: "Open", due: "Aug 11 · 9:30 AM PT", dueSort: "2026-08-11", owner: "Jordan", note: "Booth 505 is recorded in Notion, which now also confirms insurance is not needed for our pipe-and-drape booth. Use the call to close the remaining package, lead-retrieval, power, furniture, signage, and shipping questions." },
      { title: "Complete the exhibitor company profile", status: "In progress", due: "Aug 13", dueSort: "2026-08-13", owner: "Marketing", note: "The portal showed 25% complete on Aug 6. Finish the public company details and assets." },
      { title: "Add the event and complimentary-ticket link to the demo site", status: "Open", due: "Aug 13", dueSort: "2026-08-13", owner: "Marketing + Web", note: "The organizer asked for the event and free-ticket link during the first onboarding week.", url: "/sources#public-demo" },
      { title: "Reconcile portal deadlines and booth assets", status: "Open", due: "Aug 17", dueSort: "2026-08-17", owner: "Marketing", note: "Several portal dates already show Aug 5. Confirm which deliverables apply, request recovery where needed, and close the Aug 17 space-only deadline." },
      { title: "File the contract and exhibitor guide in Events Drive", status: "Open", owner: "Marketing + Operations", note: "The event folder does not yet contain these files. Save them without copying portal credentials." },
    ],
    workstreams: {
      speaking: ["None"],
      sponsorship: ["10×10 booth with an executed exhibition-space contract · booth 505", "Portal registration is complete; onboarding call is Aug 11 at 9:30 AM PT", "Insurance is not needed for our pipe-and-drape booth", "Confirm package inclusions, lead retrieval, power, furniture, signage, and shipping"],
      meetings: ["No guaranteed meetings", "Use the event app and exhibitor list to build a target list and pre-book directly"],
      swag: ["None planned"],
      secondary: ["None"],
      travel: ["Four attendees are planned; roster is “SDRs TBD”", "Name the team, then book travel and registration"],
      marketing: ["Complete the exhibitor profile; it was 25% complete on Aug 6", "Add the Customer Connect Showcase event and complimentary-ticket link to the Simple website within the first week", "Use the event app and exhibitor list to build the target account list"],
      followup: ["Capture booth context in HubSpot and assign one owner and next action per follow-up"],
      budget: ["AP processed the payment; confirm it has settled during the week of Aug 11", "Reconcile sponsor, travel, and production costs after the event"],
    },
  },
  {
    slug: "demo-event-09",
    name: "Retail CX Exchange",
    dates: "Sep 14–15, 2026",
    dateSort: "2026-09-14",
    dateEndSort: "2026-09-15",
    location: "Atlanta, GA",
    status: "Confirmed",
    speaking: "30-minute plenary",
    sponsorship: "None listed",
    guaranteedMeetings: "Yes",
    attendeeCount: 2,
    team: [],
    available: ["Morgan", "Riley", "Quinn", "Casey"],
    notes: "Final attendee assignment is not confirmed in the tracker.",
    rating: "None",
    meetingsBooked: [],
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
    notionUrl: "/sources#public-demo",
    priorityActions: [
      "Assign the two travelers and speaker; the tracker currently marks Morgan, Riley, Quinn, and Casey only as available.",
      "Confirm the guaranteed-meeting count and format; get the matched-account list from Demo Organizer.",
      "Finalize a retail plenary around the peak-season and seasonality wedge.",
      "Ship one-pagers to the hotel and decide whether to host a small prospect dinner.",
    ],
    marketingTasks: [
      { title: "Confirm the plenary speaker", status: "Open" },
      { title: "Finalize the title and abstract with Demo Organizer around the retail seasonality wedge", status: "Open" },
      { title: "Build the plenary deck and complete the Pre-Publish Gate", status: "Open" },
      { title: "Complete the AV check and rehearsal", status: "Open" },
      { title: "Confirm the meeting count and format; get the matched-account list", status: "Open" },
      { title: "Research each matched account and prepare talking points", status: "Open" },
      { title: "Log booked meetings and demos in HubSpot with the required context", status: "Open" },
      { title: "Ship one-pagers and leave-behinds to the hotel", status: "Open" },
      { title: "Decide whether to host a dinner with matched prospects and Atlanta-area accounts", status: "Open" },
      { title: "Lock the two travelers; register passes and book flights and hotel", status: "Open" },
      { title: "Publish a LinkedIn post and run targeted retail outreach with one CTA", status: "Open" },
      { title: "Send personal follow-up within one week of the event", status: "Open", due: "Sep 22 · within one week", dueSort: "2026-09-22" },
      { title: "Debrief; update the event rating in the tracker and verify meetings and demos in HubSpot", status: "Open" },
    ],
    workstreams: {
      speaking: ["30-minute plenary", "Confirm speaker and title/abstract with Demo Organizer", "Build a retail narrative around the peak-season and seasonality wedge", "Complete the Pre-Publish Gate, rehearsal, and AV check"],
      sponsorship: ["None"],
      meetings: ["Guaranteed meetings; count and format not yet confirmed", "Get the matched-account list and prepare account briefs", "Log meetings and demos in HubSpot"],
      swag: ["One-pagers and leave-behinds shipped to the hotel"],
      secondary: ["Optional dinner with matched prospects and Atlanta-area accounts; none confirmed"],
      travel: ["Assign two travelers, register passes, and book flights and hotel"],
      marketing: ["LinkedIn post and targeted outreach to retail prospects with one CTA"],
      followup: ["Send personal follow-up within the week", "Debrief, then update rating, meetings, and demos in the tracker"],
      budget: ["Track travel and material costs"],
    },
  },
  {
    slug: "demo-event-23",
    name: "MarketFlow Fall",
    dates: "Sep 29–30, 2026",
    dateSort: "2026-09-29",
    dateEndSort: "2026-09-30",
    location: "Nashville, TN",
    status: "No",
    speaking: "None",
    sponsorship: "None",
    guaranteedMeetings: "None",
    attendeeCount: 0,
    team: [],
    available: [],
    notes: "TeamSimple is not attending. The only possible activity is an unconfirmed Noko dinner.",
    rating: "None",
    meetingsBooked: [],
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
    workstreams: {
      speaking: ["None"], sponsorship: ["None"], meetings: ["None"], swag: ["None"],
      secondary: ["Possible Noko dinner only; not confirmed"], travel: ["None"],
      marketing: ["None"], followup: ["None"], budget: ["None"],
    },
  },
  {
    slug: "demo-event-17",
    name: "CX Leadership Forum",
    dates: "Oct 4–6, 2026",
    dateSort: "2026-10-04",
    dateEndSort: "2026-10-06",
    location: "The Woodlands, TX",
    status: "Confirmed",
    speaking: "50-minute interactive breakout",
    sponsorship: "None listed",
    guaranteedMeetings: "Yes",
    attendeeCount: 2,
    team: [],
    available: ["Morgan", "Riley", "Quinn", "Casey"],
    notes: "This ends the day before Service Operations Nashville starts. The two travelers here likely cannot cover both events without a deliberate handoff.",
    rating: "None",
    meetingsBooked: [], demosBooked: [], closed: [],
    organizerUrl: "https://example.com/demo-event",
    notionUrl: "/sources#public-demo",
    venue: "The Woodlands Resort",
    priorityActions: [
      "Assign the two travelers together with the Service Operations Nashville roster; do not staff these events independently.",
      "Confirm the speaker, session title, and 50-minute format with Demo Forum.",
      "Design an interactive breakout with a live Holly demo or Q&A block, not 50 minutes of slides.",
      "Confirm the guaranteed-meeting count and matched-account list, then prepare account briefs.",
    ],
    marketingTasks: [
      { title: "Confirm the breakout speaker and finalize the session title and abstract with Demo Forum", status: "Open" },
      { title: "Design the 50-minute breakout as an interactive session with a live Holly demo or Q&A block", status: "Open" },
      { title: "Build the breakout materials and complete the Pre-Publish Gate", status: "Open" },
      { title: "Complete the AV check and rehearsal", status: "Open" },
      { title: "Confirm the guaranteed-meeting count and format; get the matched-account list", status: "Open" },
      { title: "Research each matched account and prepare talking points", status: "Open" },
      { title: "Log booked meetings and demos in HubSpot with the required context", status: "Open" },
      { title: "Ship leave-behinds to the venue or hotel", status: "Open" },
      { title: "Lock the two travelers with the Service Operations Nashville overlap in mind; register and book travel", status: "Open" },
      { title: "Publish a LinkedIn post and run outreach to attending accounts with one CTA", status: "Open" },
      { title: "Send personal follow-up within one week of the event", status: "Open", due: "Oct 13 · within one week", dueSort: "2026-10-13" },
      { title: "Debrief; update the event rating in the tracker and verify meetings and demos in HubSpot", status: "Open" },
    ],
    workstreams: {
      speaking: ["50-minute breakout", "Confirm speaker and title/abstract with Demo Forum", "Plan an interactive format: live Holly demo or Q&A block", "Build materials, complete the Pre-Publish Gate, rehearse, and confirm AV"],
      sponsorship: ["None"], meetings: ["Guaranteed meetings; count and format not yet confirmed", "Get the matched-account list and prepare account briefs", "Log meetings and demos in HubSpot"],
      swag: ["Ship leave-behinds to the venue or hotel"], secondary: ["None"],
      travel: ["Assign two travelers with the Service Operations Nashville overlap in mind", "Register and book travel"],
      marketing: ["LinkedIn post and outreach to attending accounts with one CTA"],
      followup: ["Send personal follow-up within the week", "Debrief, then update rating, meetings, and demos in the tracker"],
      budget: ["Track travel and program costs"],
    },
  },
  {
    slug: "demo-event-24",
    name: "European CX Week",
    dates: "Oct 5–7, 2026",
    dateSort: "2026-10-05",
    dateEndSort: "2026-10-07",
    location: "Amsterdam, Netherlands",
    status: "No",
    speaking: "None",
    sponsorship: "None",
    guaranteedMeetings: "None",
    attendeeCount: null,
    team: [],
    available: ["Riley", "Quinn", "Casey"],
    notes: "Marked No in the source sheet. No activation is planned.",
    rating: "None",
    meetingsBooked: [], demosBooked: [], closed: [],
    organizerUrl: "https://example.com/demo-event",
    workstreams: { speaking: ["None"], sponsorship: ["None"], meetings: ["None"], swag: ["None"], secondary: ["None"], travel: ["None"], marketing: ["None"], followup: ["None"], budget: ["None"] },
  },
  {
    slug: "demo-event-25",
    name: "Service Operations Nashville",
    dates: "Oct 7–9, 2026",
    dateSort: "2026-10-07",
    dateEndSort: "2026-10-09",
    location: "Nashville, TN",
    status: "Confirmed",
    speaking: "Panel · Oct 8",
    sponsorship: "Confirm booth, inclusions and Demo community program participation",
    sponsorshipStatus: "Under review",
    guaranteedMeetings: "Yes",
    attendeeCount: 10,
    team: [],
    available: ["Morgan", "Quinn", "Casey"],
    notes: "Ten attendees, a panel, sponsor deliverables, guaranteed meetings, and the Noko dinner make this the biggest fall Demo CX plan. It starts the day after Demo Forum ends.",
    rating: "None",
    meetingsBooked: [], demosBooked: [], closed: [],
    organizerUrl: "https://example.com/demo-event",
    notionUrl: "/sources#public-demo",
    venue: "Omni Nashville",
    priorityActions: [
      "Confirm the panelist, panel topic, moderator questions, and logistics for Oct 8.",
      "Turn the sponsor contract into a deliverables list: booth, bag insert, app push, Demo community program involvement, deadlines, and lead capture.",
      "Lock the 10-person roster together with Demo Forum coverage and publish booth shifts, meetings, panel, dinner, and breaks.",
      "Book Noko with Quinn’s contacts Robin and Lee; build the invite list and track RSVPs.",
      "Confirm the guaranteed-meeting count and matched-account list, then assign research and follow-up owners.",
    ],
    relatedLinks: [
      { label: "Demo community event", url: "/sources#public-demo" },
    ],
    workstreams: {
      speaking: ["Panel on Oct 8", "Confirm panelist, topic, moderator questions, and logistics", "Use only externally cleared proof points"],
      sponsorship: ["Confirm every contract inclusion: booth, bag insert, app push, and Demo community program participation", "If a booth is included, lock backdrop, signage, lead capture, power, furniture, production, and shipping", "Publish booth staffing across the 10-person roster"],
      meetings: ["Guaranteed meetings; count and format not yet confirmed", "Get the matched-account list and prepare account briefs", "Log meetings and demos in HubSpot"],
      swag: ["Choose quantities, order, ship to the venue, and plan returns"],
      secondary: ["Book Noko Nashville through Quinn’s contacts Robin and Lee", "Build the customer/prospect invite list, send invitations, and track RSVPs"],
      travel: ["Lock the 10-person roster and register everyone", "Book flights and hotel block", "Publish an onsite schedule covering shifts, meetings, panel, dinner, and breaks"],
      marketing: ["LinkedIn posts for the panel and event presence", "Targeted email to prospects attending with one CTA", "Dinner invitations with RSVP tracking"],
      followup: ["Upload leads and start owned follow-up within the week", "Send a recap email with one CTA", "Debrief, then update rating, meetings, and demos in the tracker"],
      budget: ["Reconcile sponsorship, booth, swag, dinner and travel"],
    },
  },
  {
    slug: "demo-event-07",
    name: "Contact Center Innovation Expo",
    dates: "Oct 26–29, 2026",
    dateSort: "2026-10-26",
    dateEndSort: "2026-10-29",
    location: "Orlando, FL",
    status: "Confirmed",
    speaking: "Lunch & Learn · Wednesday · confirmation needs reconciliation",
    speakingStatus: "Under review",
    sponsorship: "Under evaluation",
    sponsorshipStatus: "Under review",
    guaranteedMeetings: "No",
    attendeeCount: 6,
    team: [],
    available: ["Morgan", "Riley", "Quinn", "Casey"],
    notes: "TeamSimple is attending. The sponsor package and Wednesday Lunch & Learn details still need confirmation.",
    rating: "None",
    meetingsBooked: [], demosBooked: [], closed: [],
    organizerUrl: "https://example.com/demo-event",
    notionUrl: "/sources#public-demo",
    venue: "Gaylord Palms Resort & Convention Center",
    priorityActions: [
      "Confirm whether the Wednesday Lunch & Learn is contracted or still part of sponsor negotiation.",
      "Decide whether to add a booth or sponsor package after comparing audience fit, total cost, and expected meetings.",
      "Name the six attendees; only Morgan, Riley, Quinn, and Casey are currently marked available.",
      "Register the final team and book the Gaylord Palms travel plan.",
    ],
    relatedLinks: [
      { label: "2026 event schedule", url: "/sources#public-demo" },
      { label: "Sponsor options", url: "/sources#public-demo" },
    ],
    workstreams: {
      speaking: ["Lunch & Learn on Wednesday appears in the tracker, but the Notion checklist still treats speaking as negotiable", "Confirm the slot before preparing content"],
      sponsorship: ["Evaluate the sponsor package and cost before committing to an activation"],
      meetings: ["No guaranteed meetings", "Build a target list and pre-book directly"],
      swag: ["None"], secondary: ["None"],
      travel: ["Six attendees planned", "Name the final team, register everyone, and book the Gaylord Palms travel plan"],
      marketing: ["None"],
      followup: ["Capture event conversations in HubSpot and assign one owner and next action per follow-up"],
      budget: ["Validate audience fit, sponsor cost, and expected meeting value before adding a paid activation"],
    },
  },
  {
    slug: "demo-event-06",
    name: "UK Service Executive Exchange",
    dates: "Nov 2–4, 2026",
    dateSort: "2026-11-02",
    dateEndSort: "2026-11-04",
    location: "London / Windsor, UK",
    status: "Confirmed",
    speaking: "45-minute interactive workshop",
    sponsorship: "None listed",
    guaranteedMeetings: "Yes",
    attendeeCount: 2,
    team: [],
    available: ["Morgan", "Riley", "Quinn", "Casey"],
    notes: "This runs on the same dates as Miami. Decide the two-event team split before either side books travel.",
    rating: "None",
    meetingsBooked: [], demosBooked: [], closed: [],
    organizerUrl: "https://example.com/demo-event",
    notionUrl: "/sources#public-demo",
    priorityActions: [
      "Assign the two travelers and workshop lead together with the Miami roster.",
      "Confirm the workshop topic and format with Demo CX; this needs worksheets or discussion prompts, not only a deck.",
      "Confirm the guaranteed-meeting count and matched-account list, then prepare account briefs.",
      "Print workshop materials in the UK to avoid customs risk.",
    ],
    workstreams: {
      speaking: ["45-minute interactive workshop", "Confirm workshop lead and topic with Demo CX", "Build worksheets or discussion prompts, complete the Pre-Publish Gate, rehearse, and confirm AV", "Keep this distinct from the separate March 2027 UK workshop"],
      sponsorship: ["None"], meetings: ["Guaranteed meetings; count and format not yet confirmed", "Get the matched-account list and prepare account briefs", "Log meetings and demos in HubSpot"],
      swag: ["Print workshop materials in the UK"], secondary: ["None"],
      travel: ["Assign two travelers with the Miami split in mind", "Register and book travel"],
      marketing: ["LinkedIn post and outreach to UK accounts with one CTA"],
      followup: ["Send personal follow-up within the week", "Debrief, then update rating, meetings, and demos in the tracker"],
      budget: ["Track UK travel and local production"],
    },
  },
  {
    slug: "demo-event-03",
    name: "Miami CX Leadership Exchange",
    dates: "Nov 2–4, 2026",
    dateSort: "2026-11-02",
    dateEndSort: "2026-11-04",
    location: "Miami, FL",
    status: "Confirmed",
    speaking: "Main-stage client case study",
    sponsorship: "None listed",
    guaranteedMeetings: "Yes",
    attendeeCount: 2,
    team: [],
    available: ["Morgan", "Quinn", "Casey"],
    notes: "The client case study has the longest lead time, and this runs on the same dates as London. Customer approval and the two-event team split come first.",
    rating: "None",
    meetingsBooked: [], demosBooked: [], closed: [],
    organizerUrl: "https://example.com/demo-event",
    notionUrl: "/sources#public-demo",
    venue: "JW Marriott Miami",
    priorityActions: [
      "Choose the customer and secure co-presenter or story approval now; this is the longest-lead item.",
      "Assign the two travelers and case-study lead together with the London roster.",
      "Confirm the guaranteed-meeting count and matched-account list, then prepare account briefs.",
      "Build the deck with externally safe proof points, complete the Pre-Publish Gate, get customer approval, and confirm the run of show.",
    ],
    workstreams: {
      speaking: ["Main-stage client case study", "Choose the customer and confirm whether they will co-present or approve the story", "Use externally safe proof points only", "Build the deck, complete the Pre-Publish Gate, secure customer approval, and confirm AV/run of show"],
      sponsorship: ["None"], meetings: ["Guaranteed meetings; count and format not yet confirmed", "Get the matched-account list and prepare account briefs", "Log meetings and demos in HubSpot"],
      swag: ["Prepare only required materials"], secondary: ["Optional dinner; none confirmed"],
      travel: ["Assign two attendees with the London split in mind", "Register and book travel"],
      marketing: ["LinkedIn post on the main-stage session after customer approval; use one CTA"],
      followup: ["Send personal follow-up within the week", "Debrief, then update rating, meetings, and demos in the tracker"],
      budget: ["Track travel and session-production costs"],
    },
  },
  {
    slug: "demo-event-02",
    name: "Customer Service East",
    dates: "Nov 17–18, 2026",
    dateSort: "2026-11-17",
    dateEndSort: "2026-11-18",
    location: "New York, NY",
    status: "Confirmed",
    speaking: "45-minute workshop",
    sponsorship: "None listed",
    guaranteedMeetings: "None listed",
    attendeeCount: 4,
    team: [],
    available: ["Morgan", "Riley", "Quinn", "Casey"],
    notes: "The tracker confirms four attendees and a 45-minute workshop, but there is no active Notion project. The execution plan still needs to be created.",
    rating: "None",
    meetingsBooked: [], demosBooked: [], closed: [],
    organizerUrl: "https://example.com/demo-event",
    priorityActions: [
      "Create the Notion project and copy in the standard workstreams.",
      "Assign the four attendees, workshop lead, and owner.",
      "Confirm the workshop title, format, audience, and organizer deadlines.",
      "Clarify whether the package includes curated meetings, materials, or other sponsor deliverables.",
    ],
    workstreams: {
      speaking: ["45-minute workshop", "Confirm lead, title, format, audience, organizer deadlines, and AV", "Build an interactive session and complete the Pre-Publish Gate"],
      sponsorship: ["None listed; confirm whether any sponsor deliverables are included"],
      meetings: ["No guaranteed-meeting information in the tracker", "Ask whether curated meetings are included; otherwise build a target list and pre-book"],
      swag: ["None planned"],
      secondary: ["None"],
      travel: ["Four attendees planned; final roster not assigned"],
      marketing: ["Confirm workshop promotion after title and speaker are approved"],
      followup: ["Capture workshop and meeting context in HubSpot, then assign one owner and next action"],
      budget: ["Confirm package inclusions, workshop costs, and travel budget"],
    },
  },
  {
    slug: "demo-event-18",
    name: "Harbor CX Forum 2027",
    dates: "Jan 25–27, 2027",
    dateSort: "2027-01-25",
    dateEndSort: "2027-01-27",
    location: "Orlando, FL",
    status: "Confirmed",
    speaking: "Main Stage Panel · Jan 26 at 4:30 PM",
    sponsorship: "Single booth + bag insert + mobile app push + name badge",
    guaranteedMeetings: "Yes · 6 Executive Leadership Exchange meetings",
    attendeeCount: 11,
    team: [],
    available: [],
    notes: "The 2027 tracker confirms the package and an 11-person plan. The attendee roster and booth number are still open.",
    rating: "None",
    meetingsBooked: [],
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
    venue: "JW Marriott Bonnet Creek",
    priorityActions: [
      "Name the 11 attendees and assign the panel lead, booth coverage, lead-capture, travel, and follow-up owners.",
      "Confirm the booth number, sponsor credentials, bag-insert specs, mobile-app push deadline, and name-badge deliverable.",
      "Confirm the Main Stage Panel topic, panelist, moderator questions, rehearsal, and AV handoff.",
      "Get the six Executive Leadership Exchange matches and prepare one account brief for each meeting.",
      "Build the booth, app, meeting, and post-event lead workflows before production starts.",
    ],
    workstreams: {
      speaking: ["Main Stage Panel on Jan 26 at 4:30 PM", "Confirm panelist, topic, moderator questions, rehearsal, and AV handoff"],
      sponsorship: ["Single booth; booth number TBD", "Package includes a bag insert, mobile app push, and name badge", "Confirm booth services, lead retrieval, sponsor credentials, deadlines, and shipping"],
      meetings: ["6 Executive Leadership Exchange meetings", "Get the matched-account list and prepare one brief per meeting", "Record every meeting and next step in HubSpot"],
      swag: ["Bag insert is contracted; confirm format, quantity, approval, production, and shipping"],
      secondary: ["None"],
      travel: ["11 attendees planned; names are open", "Assign the team before booking travel and registration"],
      marketing: ["Produce the mobile app push and bag insert after organizer specs are confirmed", "Build panel promotion around one useful point of view and CTA"],
      followup: ["Merge booth, app, and meeting leads; assign one owner and next step to each qualified contact"],
      budget: ["Reconcile the booth, sponsor deliverables, production, shipping, and 11-person travel plan"],
    },
  },
  {
    slug: "demo-event-01",
    name: "UK Service Executive Exchange 2027",
    dates: "March 2027 · exact dates TBD",
    dateSort: "2027-03-01",
    dateEndSort: "2027-03-31",
    location: "London, UK",
    status: "Confirmed",
    speaking: "45-minute workshop",
    sponsorship: "Workshop Partner + 10×10 meeting area + seat-drop collateral",
    guaranteedMeetings: "Yes · minimum 10 30-minute meetings",
    attendeeCount: 2,
    team: [],
    available: [],
    notes: "Participation is confirmed, but the tracker only gives a March window. Exact dates, venue, two-person roster, and workshop topic are still open; the package includes three passes.",
    rating: "None",
    meetingsBooked: [],
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
    credentials: "3 sponsor passes · 2 attendees planned",
    priorityActions: [
      "Get the exact March dates and venue before anyone books travel.",
      "Assign the two attendees and workshop lead; decide whether the third sponsor pass will be used.",
      "Confirm the workshop topic, audience, format, worksheets, rehearsal, and AV requirements.",
      "Get the minimum 10 matched accounts and prepare one brief for every 30-minute meeting.",
      "Confirm the 10×10 meeting-area setup and seat-drop specs, then produce locally in the UK where practical.",
    ],
    workstreams: {
      speaking: ["45-minute workshop", "Confirm lead, topic, audience, format, worksheets, rehearsal, and AV"],
      sponsorship: ["Workshop Partner", "10×10 meeting area in the Silver Sponsor Zone", "Three passes and seat-drop collateral are included"],
      meetings: ["Minimum 10 guaranteed 30-minute meetings", "Get the matched-account list and prepare one brief per meeting", "Record every meeting and next step in HubSpot"],
      swag: ["Seat-drop collateral is contracted; confirm specs and print in the UK where practical"],
      secondary: ["None"],
      travel: ["Two attendees planned; names, exact dates, and venue are open", "Three sponsor passes are included; decide whether to use the extra pass"],
      marketing: ["Promote the workshop after the topic and speaker are approved", "Use matched-account outreach with one meeting CTA"],
      followup: ["Send personal follow-up within the week, then update the tracker with meetings, demos, and lessons"],
      budget: ["Track sponsor package, local production, and UK travel"],
    },
  },
  {
    slug: "demo-event-22",
    name: "Customer Operations Week 2027",
    dates: "Jun 14–17, 2027",
    dateSort: "2027-06-14",
    dateEndSort: "2027-06-17",
    location: "Las Vegas, NV",
    status: "Confirmed",
    speaking: "Workshop + Demo community program Panel + Fireside Chat · schedule needs reconciliation",
    sponsorship: "20×20 booth + video-wall branding + welcome bag + bag insert",
    guaranteedMeetings: "None listed",
    attendeeCount: 15,
    team: [],
    available: [],
    notes: "Source conflict: The tracker labels the workshop “Mon Jun 15,” but June 15, 2027 is Tuesday. Confirm the workshop date before production. The 15-person roster and booth number are also open.",
    rating: "None",
    meetingsBooked: [],
    demosBooked: [],
    closed: [],
    organizerUrl: "https://example.com/demo-event",
    venue: "Caesars Forum",
    credentials: "9 sponsor passes · 15 attendees planned",
    priorityActions: [
      "Reconcile the workshop date: the tracker says “Mon Jun 15,” but June 15, 2027 is Tuesday.",
      "Name the 15 attendees and determine how six people beyond the nine sponsor passes will be credentialed.",
      "Confirm the workshop, Demo community program Panel, and fireside speakers, topics, formats, rehearsals, and AV handoffs.",
      "Confirm the booth number, 20×20 layout, video-wall specs, welcome-bag item, bag-insert specs, lead retrieval, and shipping deadlines.",
      "Clarify whether any meetings are guaranteed; otherwise build the target list and pre-book directly.",
    ],
    workstreams: {
      speaking: ["Workshop; tracker date needs reconciliation", "Demo community program Panel", "Fireside Chat on Jun 17 at 12:00 PM", "Assign speakers and complete content, rehearsal, and AV handoffs for all three programs"],
      sponsorship: ["20×20 booth; booth number TBD", "Video-wall branding at Caesars Forum", "Welcome bag and bag insert included", "Confirm lead retrieval, power, furniture, internet, production, and shipping"],
      meetings: ["No guaranteed meetings are listed", "Build a target list from the event app and sponsor data, then pre-book directly", "Record meetings and next steps in HubSpot"],
      swag: ["Choose the welcome-bag item and bag insert after organizer specs are confirmed", "Plan booth materials and return shipping"],
      secondary: ["None confirmed"],
      travel: ["15 attendees planned; names are open", "Nine sponsor passes are included; reconcile six additional credentials", "Book travel only after the roster and credential plan are approved"],
      marketing: ["Build one coordinated plan across the workshop, panel, fireside, booth, video wall, welcome bag, and bag insert"],
      followup: ["Merge booth, session, app, and sponsor-data leads; tier them and assign one owner and next step"],
      budget: ["Reconcile sponsorship, booth production, branding, materials, shipping, credentials, and 15-person travel"],
    },
  },
].sort((a, b) => a.dateSort.localeCompare(b.dateSort));

const trackerBaseline: EventVerification = {
  checkedAt: "Aug 6, 2026",
  checkedAtISO: "2026-08-06",
  sources: ["Conference tracker"],
};

const eventVerificationOverrides: Record<string, EventVerification> = {
  "demo-event-29": {
    checkedAt: "Aug 7, 2026",
    checkedAtISO: "2026-08-07",
    sources: ["Conference tracker", "Customer Operations Week plan", "Meetings tracker", "HubSpot"],
  },
  "demo-event-12": {
    checkedAt: "Aug 7, 2026",
    checkedAtISO: "2026-08-07",
    sources: ["Direct update", "Riley post-event feedback", "Conference tracker", "Notion", "HubSpot"],
  },
  "demo-event-28": {
    checkedAt: "Aug 6, 2026",
    checkedAtISO: "2026-08-06",
    sources: ["Direct decision", "Conference tracker"],
  },
  "demo-event-16": {
    checkedAt: "Aug 7, 2026",
    checkedAtISO: "2026-08-07",
    sources: ["Direct update", "OOH meeting notes", "Notion", "Gmail", "HubSpot", "Restricted Partner Platform brief"],
  },
  "demo-event-05": {
    checkedAt: "Aug 6, 2026",
    checkedAtISO: "2026-08-06",
    sources: ["Conference tracker", "Notion", "Gmail", "Organizer site"],
  },
  "demo-event-11": {
    checkedAt: "Aug 7, 2026",
    checkedAtISO: "2026-08-07",
    sources: ["Direct confirmation", "Jamie Rivera organizer response", "Gmail", "Notion"],
  },
  "demo-event-07": {
    checkedAt: "Aug 6, 2026",
    checkedAtISO: "2026-08-06",
    sources: ["Direct decision", "Conference tracker", "Notion"],
  },
  "demo-event-18": {
    checkedAt: "Aug 6, 2026",
    checkedAtISO: "2026-08-06",
    sources: ["2027 conference tracker", "Organizer site"],
  },
  "demo-event-01": {
    checkedAt: "Aug 6, 2026",
    checkedAtISO: "2026-08-06",
    sources: ["2027 conference tracker"],
  },
  "demo-event-22": {
    checkedAt: "Aug 6, 2026",
    checkedAtISO: "2026-08-06",
    sources: ["2027 conference tracker", "Organizer site"],
  },
};

export function getEventVerification(event: Pick<EventRecord, "slug">): EventVerification {
  return eventVerificationOverrides[event.slug] ?? trackerBaseline;
}

export const programTimeZone = "America/Los_Angeles";

export function getProgramDate(now = new Date()) {
  if (publicDemo.enabled) return publicDemo.asOfDate;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: programTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function getEventPhase(event: EventRecord, programDate = getProgramDate()): EventPhase {
  if (event.completedAt && programDate >= event.completedAt) return "past";
  if (programDate < event.dateSort) return "upcoming";
  if (programDate > event.dateEndSort) return "past";
  return "now";
}

export const eventBySlug = (slug: string) => events.find((event) => event.slug === slug);

const trackerSheetByYear = {
  "2026": { gid: "0", lastColumn: "W" },
  "2027": { gid: "113603184", lastColumn: "R" },
} as const;

const trackerRowByEventKey: Record<string, number> = {
  "demo-event-26": 2,
  "demo-event-08": 3,
  "demo-event-10": 4,
  "demo-event-13": 5,
  "demo-event-19": 6,
  "demo-event-04": 7,
  "demo-event-20": 8,
  "demo-event-27": 9,
  "demo-event-29": 10,
  "demo-event-15": 11,
  "demo-event-14": 12,
  "demo-event-21": 13,
  "demo-event-12": 14,
  "demo-event-28": 15,
  "demo-event-16": 16,
  "demo-event-05": 17,
  "demo-event-11": 18,
  "demo-event-09": 19,
  "demo-event-23": 20,
  "demo-event-17": 21,
  "demo-event-24": 22,
  "demo-event-25": 23,
  "demo-event-07": 24,
  "demo-event-06": 25,
  "demo-event-03": 26,
  "demo-event-02": 27,
  "demo-event-18": 2,
  "demo-event-01": 3,
  "demo-event-22": 4,
};

export function getEventTrackerRowUrl(eventSlug: string) {
  const event = eventBySlug(eventSlug);
  if (!event) return sourceLinks.sheet;
  const year = event.dateSort.slice(0, 4) as keyof typeof trackerSheetByYear;
  const sheet = trackerSheetByYear[year];
  if (!sheet) return sourceLinks.sheet;
  const row = trackerRowByEventKey[eventSlug];
  if (!row) return sourceLinks.sheet;
  return `/sources?source=tracker&event=${encodeURIComponent(eventSlug)}#public-demo`;
}

export const workstreamLabels: Record<WorkstreamKey, string> = {
  speaking: "Speaking prep",
  sponsorship: "Booth & sponsorship",
  meetings: "Meetings & pipeline",
  swag: "Swag & materials",
  secondary: "Secondary events",
  travel: "Travel & registration",
  marketing: "Pre-event marketing",
  followup: "Post-event follow-up",
  budget: "Budget & contract",
};

export function getWorkstreams(event: EventRecord): Record<WorkstreamKey, string[]> {
  const inactive = event.status === "No";
  const conditional = event.status === "TBD" || event.status === "Tentative";
  const base: Record<WorkstreamKey, string[]> = {
    speaking: event.speaking !== "None" ? [event.speaking] : ["None"],
    sponsorship: !event.sponsorship.toLowerCase().startsWith("none") ? [event.sponsorship] : ["None"],
    meetings:
      event.meetingsBooked.length > 0
        ? [`${event.meetingsBooked.length} meeting account${event.meetingsBooked.length === 1 ? "" : "s"} recorded`]
        : hasGuaranteedMeetingPackage(event)
          ? ["Guaranteed meetings"]
          : ["None"],
    swag: ["None"],
    secondary: ["None"],
    travel: event.team.length > 0 ? [`Attending: ${event.team.join(", ")}`] : ["None"],
    marketing: ["None"],
    followup: inactive
      ? ["None"]
      : conditional
        ? ["Standard follow-up only if participation is approved"]
        : ["Reconcile contacts, tier leads, log meetings and assign a single next action"],
    budget: ["None"],
  };

  return { ...base, ...event.workstreams };
}

export function isEmptyWorkstream(items: string[]) {
  return items.length === 0 || items.every((item) => /^none(?:\s+(?:planned|listed|confirmed))?[.!]?$/i.test(item.trim()));
}

export type WorkstreamState = "active" | "needs-confirmation" | "inactive";

export function getWorkstreamState(items: string[]): WorkstreamState {
  if (isEmptyWorkstream(items)) return "inactive";
  const needsConfirmation = items.some((item) => {
    const value = item.trim();
    return /\b(?:count and format not yet confirmed|confirmation needs reconciliation|schedule needs reconciliation|tracker date needs reconciliation|under review)\b/i.test(value)
      || /^none listed;\s*confirm whether\b/i.test(value)
      || /^(?:possible|optional)\b.*\b(?:not confirmed|none confirmed)\b/i.test(value);
  });
  return needsConfirmation ? "needs-confirmation" : "active";
}
