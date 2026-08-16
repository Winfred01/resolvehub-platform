const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const automationDocPath = path.join(repoRoot, "docs", "resolvehub-daily-development-automation.md");
const doc = fs.readFileSync(automationDocPath, "utf8");

const requiredMarkers = [
  "PR_RECONCILIATION_MODE",
  "IMPLEMENTATION_COMPLETE",
  "VALIDATION_PASSED",
  "BRANCH_PUSHED",
  "PR_MISSING",
  "BLOCKED_EXTERNAL_INTEGRATION",
  "PR_WRITE_PERMISSION_BLOCKED",
  "CONNECTOR_PR_WRITE_UNAVAILABLE",
  "GH_CLI_UNAVAILABLE",
  "GH_CLI_UNAUTHENTICATED",
  "BROWSER_FALLBACK_UNVERIFIABLE",
  "MERGED_ISSUE_NOT_CLOSED",
  "ISSUE_N_MANUAL_CLOSE_REQUIRED",
  "DRAFT_PR_OPEN",
  "REVIEW_PENDING",
  "READY_TO_MERGE",
  "MERGED",
  "ISSUE_CLOSED",
  "WORKSTREAM_COMPLETE",
];

const errors = [];
for (const marker of requiredMarkers) {
  if (!doc.includes(marker)) errors.push(`missing lifecycle marker: ${marker}`);
}

const forbidden = [
  /auto-merge\s*=\s*true/i,
  /force push/i,
];

for (const pattern of forbidden) {
  if (pattern.test(doc)) errors.push(`unsafe automation wording matched: ${pattern}`);
}

if (!doc.includes("do not submit blindly")) {
  errors.push("browser fallback must explicitly prohibit blind submission");
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  lifecycle_markers: requiredMarkers.length,
  pr_reconciliation_mode: true,
  merged_issue_reconciliation: true,
}, null, 2));
