const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const errors = [];

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), "utf8");
}

function requireFile(filePath) {
  if (!fs.existsSync(path.join(repoRoot, filePath))) {
    errors.push(`Missing required portfolio polish file: ${filePath}`);
  }
}

function requireIncludes(filePath, needle, label = needle) {
  const text = read(filePath);
  if (!text.includes(needle)) {
    errors.push(`${filePath} missing ${label}`);
  }
}

function requireNotIncludes(filePath, needle, label = needle) {
  const text = read(filePath);
  if (text.includes(needle)) {
    errors.push(`${filePath} should not include ${label}`);
  }
}

const roadmap = "docs/portfolio-polish-roadmap.md";
const automation = "docs/resolvehub-daily-development-automation.md";

for (const filePath of [
  roadmap,
  automation,
  "README.md",
  "ARCHITECTURE.md",
  "docs/analytics-assisted-v0.2-roadmap.md",
  "docs/v0.2-release-notes.md",
  "docs/demo-release-guide.md",
]) {
  requireFile(filePath);
}

if (!errors.length) {
  requireIncludes(roadmap, "PORTFOLIO_POLISH", "portfolio polish mode");
  requireIncludes(roadmap, "portfolio_status = PLANNING", "planning state");
  requireIncludes(roadmap, "portfolio_scheduler_sync_state = USER_UPDATE_REQUIRED", "scheduler not-live state");
  requireIncludes(roadmap, "roadmap_mode = ANALYTICS_ASSISTED_V0_2", "current v0.2 baseline");
  requireIncludes(roadmap, "v0_2_status = COMPLETE", "v0.2 complete baseline");
  requireIncludes(roadmap, "development_selection = PAUSED", "paused development selection baseline");
  requireIncludes(roadmap, "maintenance_status = PENDING_USER_APPROVAL", "pending approval baseline");
  requireIncludes(roadmap, "02661d9c2fe9306572b9dae06d721dea6b63dd71", "verified origin/main head");
  requireIncludes(roadmap, "PR #61", "completion PR evidence");
  requireIncludes(roadmap, "34545119953", "CI evidence");
  requireIncludes(roadmap, "1. Portfolio README / landing-page refresh", "workstream 1");
  requireIncludes(roadmap, "2. Architecture visualization", "workstream 2");
  requireIncludes(roadmap, "3. Demo workflow + fictional demo scenarios", "workstream 3");
  requireIncludes(roadmap, "4. Screenshot / visual evidence package", "workstream 4");
  requireIncludes(roadmap, "5. Portfolio guide + interview narrative", "workstream 5");
  requireIncludes(roadmap, "6. Resume-ready project description", "workstream 6");
  requireIncludes(roadmap, "7. Optional hosted-demo feasibility assessment", "workstream 7");
  requireIncludes(roadmap, "8. Portfolio readiness audit", "workstream 8");
  requireIncludes(roadmap, "9. PORTFOLIO_READY", "workstream 9");
  requireIncludes(roadmap, "docs/portfolio-demo.md", "portfolio demo target");
  requireIncludes(roadmap, "docs/portfolio-guide.md", "portfolio guide target");
  requireIncludes(roadmap, "docs/resume-project-summary.md", "resume package target");
  requireIncludes(roadmap, "SCREENSHOT_VIDEO_DEMO_PREFERRED", "hosted demo recommendation");
  requireIncludes(roadmap, "Current score: `18/30`", "current score");
  requireIncludes(roadmap, "Total score >= 25/30", "readiness threshold");
  requireIncludes(roadmap, "real_scheduler_changed = false", "scheduler unchanged marker");
  requireIncludes(roadmap, "Do not automatically start v0.3", "v0.3 safety gate");
  requireIncludes(roadmap, "Do not fabricate screenshots", "no fabricated screenshots");
  requireNotIncludes(roadmap, "portfolio_scheduler_sync_state = ACTIVE_DAILY_2000_AMERICA_TORONTO\nreal_scheduler_changed = false", "active scheduler with unchanged scheduler");
  requireNotIncludes(roadmap, "Closes #", "issue closing keyword");

  requireIncludes(automation, "PORTFOLIO_POLISH", "automation portfolio polish proposal");
  requireIncludes(automation, "portfolio_scheduler_sync_state = USER_UPDATE_REQUIRED", "automation scheduler sync required");
  requireIncludes(automation, "Do not start v0.3 product development", "automation v0.3 safety");
  requireIncludes(automation, "docs/portfolio-polish-roadmap.md", "automation roadmap pointer");

  requireIncludes("README.md", "analytics-assisted v0.2 are complete", "README completed v0.2 state");
  requireIncludes("docs/analytics-assisted-v0.2-roadmap.md", "v0_2_status = COMPLETE", "v0.2 historical completion");
  requireNotIncludes("docs/analytics-assisted-v0.2-roadmap.md", "Roadmap mode: `PORTFOLIO_POLISH`", "portfolio mode inside v0.2 roadmap");
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  proposed_roadmap_mode: "PORTFOLIO_POLISH",
  portfolio_status: "PLANNING",
  portfolio_scheduler_sync_state: "USER_UPDATE_REQUIRED",
  current_score: "18/30",
  target_threshold: "no category below 2 and total >= 25/30",
  hosted_demo_recommendation: "SCREENSHOT_VIDEO_DEMO_PREFERRED",
}, null, 2));
