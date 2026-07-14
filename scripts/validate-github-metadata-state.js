const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const statePath = path.join(process.cwd(), "docs", "github-metadata-state.json");
const mapPath = path.join(process.cwd(), "docs", "github-issue-map.md");
const foundationCloseoutPath = path.join(process.cwd(), "docs", "github-foundation-issues-closeout.md");
const coreCloseoutPath = path.join(process.cwd(), "docs", "github-core-workflow-issues-closeout.md");
const finalCloseoutPath = path.join(process.cwd(), "docs", "github-final-issues-closeout.md");
const state = JSON.parse(fs.readFileSync(statePath, "utf8").replace(/^\uFEFF/, ""));
const errors = [];

function requireValue(value, name) {
  if (value === undefined || value === null || value === "") errors.push(`${name} is missing`);
}

requireValue(state.repository?.full_name, "repository.full_name");
requireValue(state.branch, "branch");
requireValue(state.base_branch, "base_branch");
if (state.labels?.final_target_count !== 16) errors.push("expected all 16 target labels present");
if (state.milestones?.final_count !== 4) errors.push("expected 4 final milestones");
if (state.draft_pr?.exists !== true || state.draft_pr?.number !== 1) errors.push("expected draft PR #1 to exist");
if (state.draft_pr?.base !== "main") errors.push("expected PR base main");
if (state.draft_pr?.head !== "product/prd-foundation") errors.push("expected PR head product/prd-foundation");
if (state.draft_pr?.merged !== false) errors.push("expected PR not merged");
if (state.issues?.target_count !== 26) errors.push("expected 26 target issues");
if (state.issues?.created_count !== 26) errors.push("expected 26 created issues");
if (state.issues?.remaining_count !== 0) errors.push("expected 0 remaining issues");
if (state.issues?.current_batch !== "Analytics, Dashboard, Quality, Deployment and Portfolio") errors.push("unexpected issue batch");
if (state.issues?.foundation_created_count !== 7) errors.push("expected 7 foundation issues");
if (state.issues?.core_created_count !== 12) errors.push("expected 12 core issues");
if (state.issues?.analytics_dashboard_created_count !== 5) errors.push("expected 5 analytics/dashboard issues");
if (state.issues?.quality_deployment_portfolio_created_count !== 2) errors.push("expected 2 quality/deployment/portfolio issues");
if (state.validation_status?.complete !== true) errors.push("expected validation_status.complete true");
if (state.validation_status?.issues_deferred !== false) errors.push("expected no deferred issues");
if (!Array.isArray(state.issues?.created) || state.issues.created.length !== 26) errors.push("expected 26 created issue records");
if (!Array.isArray(state.issues?.remaining) || state.issues.remaining.length !== 0) errors.push("expected empty remaining issue records");

const numbers = new Set();
const graph = new Map();
for (const issue of state.issues.created || []) {
  if (numbers.has(issue.number)) errors.push(`duplicate issue number ${issue.number}`);
  numbers.add(issue.number);
  const labels = issue.labels || [];
  if (!labels.some((label) => label.startsWith("type:"))) errors.push(`issue ${issue.number} missing type label`);
  if (!labels.some((label) => label.startsWith("area:"))) errors.push(`issue ${issue.number} missing area label`);
  if (!labels.some((label) => label.startsWith("priority:"))) errors.push(`issue ${issue.number} missing priority label`);
  if (!issue.url || issue.url.includes("undefined")) errors.push(`issue ${issue.number} missing URL`);
  graph.set(issue.number, issue.dependencies || []);
}
for (const issue of state.issues.created || []) {
  for (const dep of issue.dependencies || []) {
    if (!numbers.has(dep)) errors.push(`issue ${issue.number} depends on unknown issue ${dep}`);
  }
  for (const blocked of issue.blocks || []) {
    if (!numbers.has(blocked)) errors.push(`issue ${issue.number} blocks unknown issue ${blocked}`);
  }
}
const counts = {
  foundation: (state.issues.created || []).filter((issue) => issue.milestone_number === 1).length,
  core: (state.issues.created || []).filter((issue) => issue.milestone_number === 2).length,
  analytics: (state.issues.created || []).filter((issue) => issue.milestone_number === 3).length,
  quality: (state.issues.created || []).filter((issue) => issue.milestone_number === 4).length,
};
if (counts.foundation !== 7) errors.push("expected 7 Foundation issue records");
if (counts.core !== 12) errors.push("expected 12 Core issue records");
if (counts.analytics !== 5) errors.push("expected 5 Analytics issue records");
if (counts.quality !== 2) errors.push("expected 2 Quality issue records");
if (state.issues?.duplicate_issues !== 0) errors.push("expected zero duplicate issues");
if (state.issues?.dependency_validation?.cycles_detected !== false) errors.push("expected no dependency cycles");
if (state.issues?.dependency_validation?.uses_real_issue_numbers !== true) errors.push("expected real issue numbers in dependencies");
if (state.issues?.dependency_validation?.placeholder_dependencies_found !== false) errors.push("expected no placeholder dependencies");

const visiting = new Set();
const visited = new Set();
function visit(number) {
  if (visiting.has(number)) return true;
  if (visited.has(number)) return false;
  visiting.add(number);
  for (const dep of graph.get(number) || []) {
    if (visit(dep)) return true;
  }
  visiting.delete(number);
  visited.add(number);
  return false;
}
for (const number of graph.keys()) {
  if (visit(number)) errors.push(`dependency cycle detected at issue ${number}`);
}

if (!fs.existsSync(mapPath)) errors.push("docs/github-issue-map.md is missing");
if (!fs.existsSync(foundationCloseoutPath)) errors.push("docs/github-foundation-issues-closeout.md is missing");
if (!fs.existsSync(coreCloseoutPath)) errors.push("docs/github-core-workflow-issues-closeout.md is missing");
if (!fs.existsSync(finalCloseoutPath)) errors.push("docs/github-final-issues-closeout.md is missing");
const map = fs.existsSync(mapPath) ? fs.readFileSync(mapPath, "utf8") : "";
if ((map.match(/open-created/g) || []).length !== 26) errors.push("issue map should contain 26 open-created rows");
if (map.includes("Planned - not created")) errors.push("issue map should not contain planned placeholders");

const privacyPatterns = [
  {
    category: "phone",
    pattern: /\b(?:\+?1[-.\s]?)?(?:\([2-9]\d{2}\)|[2-9]\d{2})[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    isSynthetic: (value) => /\b555[-.\s]?01\d{2}\b/.test(value),
  },
  {
    category: "email",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    isSynthetic: (value) => /@example\.test$/i.test(value),
  },
  {
    category: "address",
    pattern: /\b\d{1,6}\s+[A-Z0-9 .'-]+?\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Court|Ct|Way|Place|Pl)\b/gi,
    isSynthetic: (value) => /\bExample Street\b/i.test(value),
  },
  {
    category: "postal_code",
    pattern: /\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d\b/gi,
    isSynthetic: (value) => /^A1A[ -]?1A1$/i.test(value),
  },
  {
    category: "job_search_private_artifact",
    pattern: /\b(?:application[_-]tracker\.csv|application[_-]answer[_-]policy\.csv|candidate[_-]profile\.ya?ml|pending[_-]application[_-]questions\.csv|linkedin[_-]outreach[_-]tracker\.csv|job[_-]applications)\b/gi,
    isSynthetic: () => false,
    isAllowedPath: (filePath) => [".gitignore", "scripts/validate-planning-foundation.js"].includes(filePath),
  },
];

function scanTextForPrivateData(text, filePath, options = {}) {
  const allowSynthetic = options.allowSynthetic !== false;
  const findings = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const rule of privacyPatterns) {
      if (rule.isAllowedPath?.(filePath)) continue;
      rule.pattern.lastIndex = 0;
      let match;
      while ((match = rule.pattern.exec(line)) !== null) {
        const matchedText = match[0];
        if (allowSynthetic && rule.isSynthetic(matchedText)) continue;
        findings.push({ category: rule.category, file: filePath, line: i + 1 });
      }
    }
  }
  return findings;
}

function assertFinds(text, category, label) {
  const findings = scanTextForPrivateData(text, "synthetic-fixture.txt", { allowSynthetic: false });
  if (!findings.some((finding) => finding.category === category)) {
    errors.push(`privacy unit test failed: ${label}`);
  }
}

function assertClean(text, label, filePath = "synthetic-policy.md") {
  const findings = scanTextForPrivateData(text, filePath, { allowSynthetic: true });
  if (findings.length) errors.push(`privacy unit test failed: ${label}`);
}

function runPrivacyUnitTests() {
  const syntheticJobTrackerName = ["application", "tracker.csv"].join("_");
  const syntheticAnswerPolicyName = ["application", "answer", "policy.csv"].join("_");
  assertFinds("+1 416 555 0100", "phone", "synthetic phone detected");
  assertFinds("person@example.test", "email", "synthetic email detected");
  assertFinds("123 Example Street", "address", "synthetic address detected");
  assertFinds("A1A 1A1", "postal_code", "synthetic postal code detected");
  assertClean("person@example.test can be used in synthetic fixtures", "example.test allowlisted");
  assertClean("123 Example Street can be used in synthetic fixtures", "Example Street allowlisted");
  assertClean("+1 416 555 0100 can be used in synthetic fixtures", "reserved phone allowlisted");
  assertClean("A1A 1A1 can be used in synthetic fixtures", "synthetic postal code allowlisted");
  assertClean("Allowed field names: phone, address, postal_code, email", "field names do not trip scanner");
  assertClean(String(privacyPatterns[0].pattern), "detector regex source does not trip scanner");
  assertFinds(syntheticJobTrackerName, "job_search_private_artifact", "job tracker filename detected");
  assertFinds(syntheticAnswerPolicyName, "job_search_private_artifact", "application answer filename detected");
  assertClean(`${syntheticJobTrackerName}\n${syntheticAnswerPolicyName}`, "gitignore can list blocked artifacts", ".gitignore");
  assertClean("SECRET_KEY=\nDATABASE_URL=\nAPI_BASE_URL=http://localhost:3000", ".env.example placeholders are safe", ".env.example");
}

function listTrackedFiles() {
  const output = childProcess.execFileSync("git", ["ls-files"], { encoding: "utf8" });
  return output.split(/\r?\n/).filter(Boolean);
}

function scanTrackedFiles() {
  const findings = [];
  for (const filePath of listTrackedFiles()) {
    if (!fs.existsSync(filePath)) continue;
    const buffer = fs.readFileSync(filePath);
    if (buffer.includes(0)) continue;
    const text = buffer.toString("utf8");
    findings.push(...scanTextForPrivateData(text, filePath, { allowSynthetic: true }));
  }
  return findings;
}

runPrivacyUnitTests();
const privacyFindings = scanTrackedFiles();
for (const finding of privacyFindings) {
  errors.push(`privacy finding: ${finding.category} at ${finding.file}:${finding.line}`);
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({
  ok: true,
  created_issues: state.issues.created_count,
  milestone_counts: counts,
  remaining_issues: state.issues.remaining_count,
  draft_pr: state.draft_pr.number,
  privacy_unit_tests: 14,
  privacy_findings: 0,
}, null, 2));
