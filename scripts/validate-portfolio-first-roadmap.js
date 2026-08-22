const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const errors = [];

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), "utf8");
}

function requireIncludes(filePath, needle, label = needle) {
  const text = read(filePath);
  if (!text.includes(needle)) {
    errors.push(`${filePath} missing ${label}`);
  }
}

function requireIncludesNormalized(filePath, needle, label = needle) {
  const text = read(filePath).replace(/\s+/g, " ");
  const normalizedNeedle = needle.replace(/\s+/g, " ");
  if (!text.includes(normalizedNeedle)) {
    errors.push(`${filePath} missing ${label}`);
  }
}

function requireNotIncludes(filePath, needle, label = needle) {
  const text = read(filePath);
  if (text.includes(needle)) {
    errors.push(`${filePath} should not include ${label}`);
  }
}

const roadmap = "docs/portfolio-first-v0.1-roadmap.md";
const automation = "docs/resolvehub-daily-development-automation.md";
const issueMap = "docs/github-issue-map.md";
const plan = "docs/14-day-development-plan.md";
const manualIssueUpdates = "docs/manual-github-issue-updates.md";

for (const filePath of [roadmap, automation, issueMap, plan, manualIssueUpdates]) {
  if (!fs.existsSync(path.join(repoRoot, filePath))) {
    errors.push(`Missing required roadmap file: ${filePath}`);
  }
}

if (!errors.length) {
  for (const filePath of [roadmap, automation, issueMap, "README.md", "ARCHITECTURE.md"]) {
    requireIncludes(filePath, "PORTFOLIO_FIRST_V0_1", "roadmap mode");
  }

  requireIncludes(plan, "historical baseline", "historical baseline marker");
  requireIncludesNormalized(plan, "no longer the authoritative automation issue-selection source", "14-day deactivation");

  requireIncludes(roadmap, "#21 Dashboard APIs", "Issue #21 roadmap start");
  requireIncludes(roadmap, "Issue #24 and Issue #25 are not required", "v0.1 analytics deferral");
  requireIncludes(roadmap, "ENABLE_V0_1_ANALYTICS_STRETCH = true", "stretch flag");
  requireIncludes(roadmap, "Historical merged branch or worktree directories do not block", "historical worktree rule");
  requireIncludes(roadmap, "Use `Closes #N`", "PR closes linkage");
  requireIncludes(roadmap, "BLOCKED_EXTERNAL_CLOSED", "external blocker terminal semantics");

  requireIncludes(automation, "WORKSTREAM_CLASSIFIED", "workstream classification");
  requireIncludes(automation, "PR_CREATION_PENDING", "PR creation pending state");
  requireIncludes(automation, "Stable External Blocker Policy", "stable blocker policy");
  requireIncludes(automation, "Run-log Policy", "run-log policy");
  requireIncludes(automation, "Validation Tiers", "validation tiers");
  requireIncludes(automation, "`Closes #N`", "PR linkage policy");
  requireIncludes(automation, "MAINTENANCE_PENDING_CLOSED", "maintenance terminal state");
  requireIncludes(automation, "mvp_status = COMPLETE", "MVP completion memory");

  requireIncludes(issueMap, "#23 is optional stretch", "Issue #23 optional overlay");
  requireIncludes(issueMap, "#24 and #25 are deferred to v0.2", "Issue #24/#25 deferred overlay");
  requireIncludes(issueMap, "#8, #12, #20, #22 for Portfolio-first v0.1", "Issue #26 scoped dependency");
  requireIncludes(issueMap, "#7, #8, #26, #22 for Portfolio-first v0.1", "Issue #27 scoped dependency");
  requireIncludes(manualIssueUpdates, "MANUAL_GITHUB_ISSUE_UPDATE_REQUIRED", "manual GitHub issue update status");
  requireIncludes(manualIssueUpdates, "Full #25 analytics workflow integration is not a hard prerequisite", "manual #26 dependency text");

  requireNotIncludes(
    "README.md",
    "These are planning choices. They do not mean the code has already been implemented.",
    "obsolete implementation disclaimer"
  );
  requireNotIncludes("ARCHITECTURE.md", "Current status: planning only.", "obsolete planning-only architecture status");
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  roadmap_mode: "PORTFOLIO_FIRST_V0_1",
  stable_blocker_policy: true,
  validation_tiers: 4,
  deferred_analytics_issues: [24, 25],
}, null, 2));
