const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const requiredFiles = [
  "README.md",
  "ARCHITECTURE.md",
  "AGENTS.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "LICENSE",
  ".gitignore",
  "docs/repository-audit.md",
  "docs/PRD.md",
  "docs/user-stories.md",
  "docs/api-contract.md",
  "docs/database-schema.md",
  "docs/deployment-plan.md",
  "docs/testing-strategy.md",
  "docs/security-model.md",
  "docs/accessibility-plan.md",
  "docs/observability-plan.md",
  "docs/demo-plan.md",
  "docs/resume-bullets.md",
  "docs/interview-notes.md",
  "docs/branch-worktree-plan.md",
  "docs/14-day-development-plan.md",
  "docs/github-issues-plan.md",
  "docs/github-milestones-plan.md",
];

const requiredDirs = [
  "frontend",
  "backend",
  "analytics-service",
  "database",
  "infrastructure",
  "docs",
  "tests",
  "scripts",
  ".github/ISSUE_TEMPLATE",
  ".github/workflows",
];

const syntheticAllowlist = [
  /@example\.test\b/i,
  /\bExample Street\b/i,
  /\b555[-. ]?01\d{2}\b/,
  /\bA1A[ -]?1A1\b/i,
];

const forbiddenPatterns = [
  { category: "phone", pattern: /\b(?:\+?1[-. ]?)?(?:\([2-9]\d{2}\)|[2-9]\d{2})[-. ]?\d{3}[-. ]?\d{4}\b/g },
  { category: "postal_code", pattern: /\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d\b/gi },
  { category: "address", pattern: /\b\d{1,6}\s+[A-Z0-9 .'-]+?\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Court|Ct|Way|Place|Pl)\b/gi },
  { category: "token", pattern: /github_pat_|ghp_|sk-[A-Za-z0-9]|ntn_[A-Za-z0-9]|secret_[A-Za-z0-9]/i },
  { category: "submitted_tracker", pattern: /application_tracker\.csv.+Submitted/i },
];

function read(file) {
  return fs.readFileSync(path.join(repoRoot, file), "utf8");
}

function fail(message) {
  throw new Error(message);
}

function isSynthetic(text) {
  return syntheticAllowlist.some((pattern) => pattern.test(text));
}

function scanForPrivateData(text, file) {
  const findings = [];
  for (const rule of forbiddenPatterns) {
    rule.pattern.lastIndex = 0;
    let match;
    while ((match = rule.pattern.exec(text)) !== null) {
      if (isSynthetic(match[0])) continue;
      findings.push(`${rule.category} in ${file}`);
      if (!rule.pattern.global) break;
    }
  }
  return findings;
}

for (const dir of requiredDirs) {
  if (!fs.existsSync(path.join(repoRoot, dir))) fail(`Missing directory: ${dir}`);
}

for (const file of requiredFiles) {
  const full = path.join(repoRoot, file);
  if (!fs.existsSync(full)) fail(`Missing file: ${file}`);
  const text = read(file);
  if (!text.trim()) fail(`Blank required file: ${file}`);
  const findings = scanForPrivateData(text, file);
  if (findings.length) fail(`Potential private data: ${findings.join(", ")}`);
}

const readme = read("README.md");
const readmeLinks = [...readme.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]).filter((href) => !href.startsWith("http"));
for (const href of readmeLinks) {
  if (!fs.existsSync(path.join(repoRoot, href))) fail(`Broken README link: ${href}`);
}

const gitignore = read(".gitignore");
for (const rule of [".env", ".env.*", "!.env.example", "node_modules/", "target/", ".venv/", "secrets/", "*.pem", "*.key", "application_tracker.csv", "reporting/", "browser-data/"]) {
  if (!gitignore.includes(rule)) fail(`Missing .gitignore rule: ${rule}`);
}

const issuePlan = read("docs/github-issues-plan.md");
const issueCount = (issuePlan.match(/^\d+\. /gm) || []).length;
if (issueCount < 24) fail(`Expected at least 24 planned issues; found ${issueCount}`);

const milestonePlan = read("docs/github-milestones-plan.md");
const milestoneCount = (milestonePlan.match(/^\d+\. `/gm) || []).length;
if (milestoneCount !== 4) fail(`Expected 4 milestones; found ${milestoneCount}`);

const dayPlan = read("docs/14-day-development-plan.md");
for (let day = 1; day <= 14; day += 1) {
  if (!dayPlan.includes(`Day ${day}`)) fail(`Missing Day ${day} plan`);
}

const architecture = read("ARCHITECTURE.md");
const mermaidBlocks = (architecture.match(/```mermaid/g) || []).length;
const mermaidEnds = (architecture.match(/```/g) || []).length;
if (mermaidBlocks < 1 || mermaidEnds < mermaidBlocks * 2) fail("Mermaid block appears incomplete");

console.log(JSON.stringify({
  ok: true,
  required_files: requiredFiles.length,
  required_dirs: requiredDirs.length,
  planned_issues: issueCount,
  planned_milestones: milestoneCount,
}, null, 2));
