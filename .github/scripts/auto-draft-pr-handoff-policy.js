function isProtectedBranch(branch) {
  return branch === "main" || branch === "master";
}

function isIssueBranch(branch) {
  return /(^|\/)issue-\d+-/.test(branch);
}

function isDocsStatusRefreshBranch(branch) {
  return /^docs\/status-refresh-[A-Za-z0-9._\/-]+$/.test(branch);
}

function isDocsExecutionPlanBranch(branch) {
  return /^docs\/september-[A-Za-z0-9._-]+-v[A-Za-z0-9._-]+-execution-plan$/.test(branch);
}

function isEligibleBranch(branch) {
  return !isProtectedBranch(branch) && (
    isIssueBranch(branch) ||
    isDocsStatusRefreshBranch(branch) ||
    isDocsExecutionPlanBranch(branch)
  );
}

function getIssueNumber(branch) {
  const match = branch.match(/(^|\/)issue-(\d+)-/);
  return match ? Number.parseInt(match[2], 10) : null;
}

function conventionalPrefixForBranch(branch) {
  if (branch.startsWith("fix/") || branch.includes("/fix-")) return "fix";
  if (branch.startsWith("docs/") || branch.includes("/docs-")) return "docs";
  if (branch.startsWith("qa/") || branch.startsWith("test/") || branch.includes("/test-")) return "test";
  if (branch.startsWith("chore/") || branch.startsWith("automation/")) return "chore";
  if (branch.startsWith("release/") || branch.includes("/release-")) return "release";
  return "feat";
}

function titleForIssueBranch(branch, issueNumber, issueTitle) {
  const prefix = conventionalPrefixForBranch(branch);
  return `${prefix}: ${issueTitle} (#${issueNumber})`;
}

function titleForDocsStatusRefresh(branch) {
  const match = branch.match(/issue[-_ ]?(\d+)/i);
  if (match) {
    return `docs: refresh project status after Issue #${match[1]} merge`;
  }
  return "docs: refresh project status";
}

function titleForDocsExecutionPlan(branch) {
  if (branch === "docs/september-2026-v0.2-execution-plan") {
    return "docs: add September 2026 v0.2 execution plan";
  }
  return "docs: add monthly execution plan";
}

function titleForDocsBranch(branch) {
  if (isDocsExecutionPlanBranch(branch)) return titleForDocsExecutionPlan(branch);
  return titleForDocsStatusRefresh(branch);
}

function issuePrBody(branch, issueNumber) {
  return `## Summary\n\nAutomated Draft PR handoff for Issue #${issueNumber}.\n\n## Branch\n\n\`${branch}\`\n\n## Review policy\n\n- Created automatically after the implementation branch was pushed.\n- Do not automatically mark Ready for Review.\n- Do not automatically approve.\n- Do not automatically merge.\n- Do not enable auto-merge.\n- Review implementation and CI evidence before merge.\n\n## Issue\n\nCloses #${issueNumber}.\n`;
}

function docsStatusRefreshPrBody(branch) {
  return `## Summary\n\nAutomated Draft PR handoff for a ResolveHub documentation/status-refresh workstream.\n\n## Branch\n\n\`${branch}\`\n\n## Review policy\n\n- Documentation/governance handoff only.\n- Do not automatically mark Ready for Review.\n- Do not automatically approve.\n- Do not automatically merge.\n- Do not enable auto-merge.\n- No Issue closing keyword is added automatically.\n`;
}

function docsPrBody(branch) {
  return `## Summary\n\nAutomated Draft PR handoff for a ResolveHub documentation/governance workstream.\n\n## Branch\n\n\`${branch}\`\n\n## Review policy\n\n- Documentation/governance handoff only.\n- Do not automatically mark Ready for Review.\n- Do not automatically approve.\n- Do not automatically merge.\n- Do not enable auto-merge.\n- No Issue closing keyword is added automatically.\n`;
}

module.exports = {
  isProtectedBranch,
  isIssueBranch,
  isDocsStatusRefreshBranch,
  isDocsExecutionPlanBranch,
  isEligibleBranch,
  getIssueNumber,
  conventionalPrefixForBranch,
  titleForIssueBranch,
  titleForDocsStatusRefresh,
  titleForDocsExecutionPlan,
  titleForDocsBranch,
  issuePrBody,
  docsStatusRefreshPrBody,
  docsPrBody,
};
