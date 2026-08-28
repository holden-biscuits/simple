export const publicDemo = {
  enabled: true,
  asOfDate: "2026-08-08",
  label: "Public demo",
  notice: "All people, accounts, activity, costs, and outcomes shown here are synthetic examples.",
  sourceHref: "/sources#public-demo",
} as const;

export function demoSourceUrl(source: string, eventKey?: string) {
  const params = new URLSearchParams({ source });
  if (eventKey) params.set("event", eventKey);
  return `/sources?${params.toString()}#public-demo`;
}
