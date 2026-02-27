export function buildFixPrompt(issueTitle: string, details: string): string {
  return [
    "You are my senior security engineer.",
    `Issue: ${issueTitle}`,
    `Details: ${details}`,
    "Task:",
    "1) Explain root cause briefly.",
    "2) Provide exact code-level fix.",
    "3) Add regression test steps.",
    "4) Return patch-ready response for Next.js app.",
  ].join("\n");
}
