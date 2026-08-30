const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const errors = [];

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), "utf8");
}

function requireFile(filePath) {
  if (!fs.existsSync(path.join(repoRoot, filePath))) {
    errors.push(`Missing required v0.2 roadmap file: ${filePath}`);
  }
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

const roadmap = "docs/analytics-assisted-v0.2-roadmap.md";
const v01Roadmap = "docs/portfolio-first-v0.1-roadmap.md";
const automation = "docs/resolvehub-daily-development-automation.md";
const issueMap = "docs/github-issue-map.md";

for (const filePath of [roadmap, v01Roadmap, automation, issueMap, "README.md", "ARCHITECTURE.md", "docs/testing-strategy.md", "docs/security-model.md", "analytics-service/README.md", "backend/README.md", "frontend/README.md"]) {
  requireFile(filePath);
}

if (!errors.length) {
  requireIncludes(roadmap, "ANALYTICS_ASSISTED_V0_2", "v0.2 roadmap mode");
  requireIncludes(roadmap, "EXPLAINABLE_ANALYTICS_ASSISTED_TRIAGE_V0_2", "v0.2 product theme");
  requireIncludes(roadmap, "Portfolio-first v0.1 is complete", "stable v0.1 baseline");
  requireIncludes(roadmap, "#23 Category and Priority Suggestion Service", "Issue #23 first");
  requireIncludes(roadmap, "#24 Duplicate Ticket Suggestion", "Issue #24 second");
  requireIncludes(roadmap, "#25 Integrate Analytics Suggestions with Ticket Workflow", "Issue #25 third");
  requireIncludes(roadmap, "Analytics-specific v0.2 Quality / Security / E2E workstream", "quality follow-up");
  requireIncludes(roadmap, "v0.2 Demo / Documentation / Release workstream", "release follow-up");
  requireIncludes(roadmap, "Do not claim `ANALYTICS_ASSISTED_V0_2` is live", "scheduler sync gate");
  requireIncludes(roadmap, "Do not parallelize #23 and", "serial #23/#24 policy");
  requireIncludes(roadmap, "autonomous ticket mutation", "autonomous mutation non-goal");
  requireIncludes(roadmap, "external AI provider calls", "external AI non-goal");
  requireIncludes(roadmap, "V0_2_CORE", "core issue role marker");

  requireIncludesNormalized(v01Roadmap, "Portfolio-first v0.1 is complete", "v0.1 completed record");
  requireIncludes(v01Roadmap, "Issue #24 and Issue #25 are not required", "v0.1 deferral preserved");
  requireNotIncludes(v01Roadmap, "Roadmap mode: `ANALYTICS_ASSISTED_V0_2`", "v0.2 mode as v0.1 roadmap mode");

  requireIncludes(automation, "ANALYTICS_ASSISTED_V0_2", "v0.2 automation mode");
  requireIncludes(automation, "BEGIN V0.2 ROADMAP PLANNING", "authorized planning transition");
  requireIncludesNormalized(automation, "Do not begin Issue #23 implementation", "planning-only gate");
  requireIncludes(automation, "SUPERSEDED_BY_V0_2_DEVELOPMENT", "maintenance transition");

  requireIncludes(issueMap, "Current v0.2 planning overlay", "v0.2 issue map overlay");
  requireIncludes(issueMap, "#23 is promoted to V0_2_CORE", "Issue #23 promotion");
  requireIncludes(issueMap, "#24 is promoted to V0_2_CORE", "Issue #24 promotion");
  requireIncludes(issueMap, "#25 is promoted to V0_2_CORE", "Issue #25 promotion");

  requireIncludes("README.md", "ANALYTICS_ASSISTED_V0_2", "README v0.2 mode");
  requireIncludes("ARCHITECTURE.md", "Analytics-assisted v0.2", "architecture v0.2 section");
  requireIncludes("docs/testing-strategy.md", "v0.2 analytics-specific gates", "testing v0.2 gates");
  requireIncludes("docs/security-model.md", "Analytics-Assisted Triage Guardrails", "security v0.2 guardrails");
  requireIncludes("analytics-service/README.md", "v0.2 roadmap", "analytics README v0.2 scope");
  requireIncludes("backend/README.md", "analytics-assisted v0.2", "backend README v0.2 boundary");
  requireIncludes("frontend/README.md", "analytics-assisted v0.2", "frontend README v0.2 boundary");
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  roadmap_mode: "ANALYTICS_ASSISTED_V0_2",
  v0_1_status: "COMPLETE",
  v0_2_status_after_merge_and_scheduler_sync: "ACTIVE",
  core_issues: [23, 24, 25],
  follow_up_workstreams: [
    "analytics-specific-quality-security-e2e",
    "v0.2-demo-documentation-release"
  ],
  implementation_started: false
}, null, 2));