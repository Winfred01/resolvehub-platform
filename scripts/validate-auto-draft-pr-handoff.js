const fs = require("fs");
const path = require("path");
const policy = require("../.github/scripts/auto-draft-pr-handoff-policy.js");

const repoRoot = path.resolve(__dirname, "..");
const workflowPath = path.join(repoRoot, ".github/workflows/auto-draft-pr-handoff.yml");
const workflow = fs.readFileSync(workflowPath, "utf8");
const errors = [];

function requireIncludes(needle, label = needle) {
  if (!workflow.includes(needle)) errors.push(`workflow missing ${label}`);
}

function requireNotIncludes(needle, label = needle) {
  if (workflow.includes(needle)) errors.push(`workflow should not include ${label}`);
}

function assert(condition, message) {
  if (!condition) errors.push(message);
}

requireIncludes("name: Auto Draft PR Handoff", "workflow name");
requireIncludes("push:", "push trigger");
requireIncludes('"**/issue-*-*"', "issue branch push filter");
requireIncludes('"docs/status-refresh-*"', "docs status-refresh push filter");
requireIncludes('"docs/september-*-v*-execution-plan"', "monthly execution-plan push filter");
requireIncludes('"qa/v0.2-analytics-quality-*"', "v0.2 analytics quality push filter");
requireIncludes("workflow_dispatch:", "workflow_dispatch trigger");
requireIncludes('cron: "17 * * * *"', "hourly fallback schedule");
requireIncludes("contents: read", "least-privilege contents permission");
requireIncludes("issues: read", "least-privilege issues permission");
requireIncludes("pull-requests: write", "least-privilege PR permission");
requireIncludes("github-token: ${{ github.token }}", "built-in GitHub token");
requireIncludes("state: \"all\"", "open and closed PR duplicate search");
requireIncludes("comparison.data.ahead_by === 0", "merged branch skip");
requireIncludes("draft: true", "Draft PR creation");
requireIncludes("ONE_TIME_REPOSITORY_SETTING_REQUIRED", "repository setting failure classification");

requireNotIncludes("write-all", "write-all permission");
requireNotIncludes("secrets.GITHUB_TOKEN", "secrets token alias");
requireNotIncludes(["github", "pat", ""].join("_"), "GitHub PAT literal");
requireNotIncludes(["g", "h", "p", "_"].join(""), "GitHub PAT prefix");
requireNotIncludes("pulls.merge", "PR merge API call");
requireNotIncludes("enablePullRequestAutoMerge", "auto-merge API call");
requireNotIncludes("createReview", "review approval API call");
requireNotIncludes("markPullRequestReadyForReview", "ready-for-review API call");
requireNotIncludes("ready_for_review", "ready-for-review REST state");
requireNotIncludes("force: true", "force ref update");

assert(!policy.isEligibleBranch("main"), "main must never be eligible");
assert(!policy.isEligibleBranch("master"), "master must never be eligible");
assert(policy.isEligibleBranch("backend/issue-21-dashboard-apis"), "backend issue branch should be eligible");
assert(policy.isEligibleBranch("frontend/issue-22-dashboard-ui"), "frontend issue branch should be eligible");
assert(policy.isEligibleBranch("qa/issue-26-quality-gates"), "qa issue branch should be eligible");
assert(policy.isEligibleBranch("qa/v0.2-analytics-quality-security-e2e"), "v0.2 analytics quality branch should be eligible");
assert(policy.isEligibleBranch("release/issue-27-v0.1-release"), "release issue branch should be eligible");
assert(policy.isEligibleBranch("docs/status-refresh-after-issue22"), "docs status refresh branch should be eligible");
assert(policy.isEligibleBranch("docs/september-2026-v0.2-execution-plan"), "monthly execution-plan branch should be eligible");
assert(!policy.isEligibleBranch("automation/auto-draft-pr-handoff"), "automation bootstrap branch should not self-trigger as a candidate");
assert(policy.getIssueNumber("frontend/issue-26-example") === 26, "issue number extraction should work");
assert(policy.titleForIssueBranch("qa/issue-26-quality-gates", 26, "Add integrated quality gates") === "test: Add integrated quality gates (#26)", "qa issue branch should use test prefix");
assert(policy.titleForDocsStatusRefresh("docs/status-refresh-after-issue22") === "docs: refresh project status after Issue #22 merge", "docs status title should mention issue context without closing it");
assert(policy.titleForDocsExecutionPlan("docs/september-2026-v0.2-execution-plan") === "docs: add September 2026 v0.2 execution plan", "monthly execution-plan title should be specific");
assert(policy.titleForDocsBranch("docs/september-2026-v0.2-execution-plan") === "docs: add September 2026 v0.2 execution plan", "docs branch title router should support monthly plans");
assert(policy.titleForV02AnalyticsQualityBranch("qa/v0.2-analytics-quality-security-e2e") === "test: add v0.2 analytics quality gates", "v0.2 analytics quality title should be specific");
assert(policy.issuePrBody("frontend/issue-26-example", 26).includes("Closes #26."), "issue PR body should close matching issue");
assert(!policy.docsStatusRefreshPrBody("docs/status-refresh-after-issue22").includes("Closes #"), "docs status PR body must not close issues");
assert(!policy.docsStatusRefreshPrBody("docs/status-refresh-after-issue22").includes("Closes #22"), "docs status PR body must not close #22");
assert(!policy.docsStatusRefreshPrBody("docs/status-refresh-after-issue22").includes("Closes #26"), "docs status PR body must not close #26");
assert(!policy.docsPrBody("docs/september-2026-v0.2-execution-plan").includes("Closes #"), "docs planning PR body must not close issues");
assert(!policy.docsPrBody("docs/september-2026-v0.2-execution-plan").includes("Closes #24"), "docs planning PR body must not close #24");
assert(!policy.docsPrBody("docs/september-2026-v0.2-execution-plan").includes("Closes #25"), "docs planning PR body must not close #25");
assert(!policy.v02AnalyticsQualityPrBody("qa/v0.2-analytics-quality-security-e2e").includes("Closes #"), "v0.2 analytics quality PR body must not close issues");
assert(policy.v02AnalyticsQualityPrBody("qa/v0.2-analytics-quality-security-e2e").includes("Related to #25"), "v0.2 analytics quality PR body should link Issue #25 as context only");

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  workflow: ".github/workflows/auto-draft-pr-handoff.yml",
  checks: {
    least_privilege_permissions: true,
    duplicate_protection: true,
    merged_branch_protection: true,
    protected_branches_excluded: true,
    docs_status_refresh_has_no_issue_close: true,
    docs_execution_plan_has_no_issue_close: true,
    v02_analytics_quality_has_no_issue_close: true,
    no_pat_or_credential_handling: true,
    no_ready_approval_merge_or_automerge: true,
  },
}, null, 2));
