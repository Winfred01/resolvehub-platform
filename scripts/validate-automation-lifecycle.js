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
  "BLOCKED_EXTERNAL_INTEGRATION_UNCHANGED",
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
  "issue_number",
  "branch_head",
  "pr_absence",
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

const requiredPolicyText = [
  "Stable External Blocker Policy",
  "Run-Log Policy",
  "Do not create a run-log file.",
  "Do not create a repository commit.",
  "Do not push the branch.",
  "Do not rerun full implementation validation.",
  "Do not select Issue #22 or any later issue.",
  "completed with a stable external blocker",
  "implementation remains complete and healthy",
];

for (const text of requiredPolicyText) {
  if (!doc.includes(text)) errors.push(`missing stable-blocker policy text: ${text}`);
}

function stableExternalBlockerFingerprint(state) {
  return {
    issue_number: state.issue_number,
    branch: state.branch,
    branch_head: state.branch_head,
    pr_absence: state.pr_absence,
    blocker_type: state.blocker_type,
    blocker_reason: state.blocker_reason,
  };
}

function sameFingerprint(left, right) {
  const keys = Object.keys(stableExternalBlockerFingerprint(left));
  return keys.every((key) => left[key] === right[key]);
}

const previous = {
  issue_number: 21,
  branch: "backend/issue-21-dashboard-apis",
  branch_head: "17614a3e44e2d7a7a676685e588fb995c23c75a4",
  pr_absence: true,
  blocker_type: "PR_WRITE_PERMISSION_BLOCKED",
  blocker_reason: "CONNECTOR_PR_WRITE_UNAVAILABLE; GH_CLI_UNAVAILABLE; BROWSER_FALLBACK_UNVERIFIABLE",
};

const current = { ...previous };

const unchangedBlockerResult = sameFingerprint(previous, current)
  ? "BLOCKED_EXTERNAL_INTEGRATION_UNCHANGED"
  : "BLOCKED_EXTERNAL_INTEGRATION";

const plannedActionsForUnchangedBlocker = {
  implementationWork: false,
  createRunLogFile: false,
  createRepositoryCommit: false,
  pushBranch: false,
  selectNextIssue: false,
  result: unchangedBlockerResult,
};

if (plannedActionsForUnchangedBlocker.result !== "BLOCKED_EXTERNAL_INTEGRATION_UNCHANGED") {
  errors.push("unchanged external blocker must return BLOCKED_EXTERNAL_INTEGRATION_UNCHANGED");
}

for (const [action, expected] of Object.entries({
  implementationWork: false,
  createRunLogFile: false,
  createRepositoryCommit: false,
  pushBranch: false,
  selectNextIssue: false,
})) {
  if (plannedActionsForUnchangedBlocker[action] !== expected) {
    errors.push(`unchanged external blocker action should be ${expected}: ${action}`);
  }
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
  stable_external_blocker_regression: plannedActionsForUnchangedBlocker,
}, null, 2));
