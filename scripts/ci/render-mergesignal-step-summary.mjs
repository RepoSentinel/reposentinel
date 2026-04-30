/**
 * Append MergeSignal scan markdown to GITHUB_STEP_SUMMARY (GitHub Actions).
 * Single source of truth for job summary presentation — do not duplicate elsewhere.
 *
 * Usage: node scripts/ci/render-mergesignal-step-summary.mjs <path-to-mergesignal-scan.json>
 */
import fs from "node:fs";

const jsonPath = process.argv[2] || "mergesignal-scan.json";
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

if (!summaryPath) {
  console.error(
    "render-mergesignal-step-summary: GITHUB_STEP_SUMMARY is not set",
  );
  process.exit(1);
}

const raw = fs.readFileSync(jsonPath, "utf8");
const r = JSON.parse(raw);
const total = r.totalScore ?? null;
const layers = r.layerScores ?? {};
const recs = Array.isArray(r.recommendations) ? r.recommendations : [];
const gi = r.graphInsights ?? {};

function getRiskStatus(score) {
  if (score === null) return { emoji: "⚪", label: "Unknown risk" };
  if (score >= 70) return { emoji: "🔴", label: "High risk" };
  if (score >= 40) return { emoji: "⚠️", label: "Medium risk" };
  return { emoji: "✅", label: "Low risk" };
}

function getActionMeta(rec) {
  const impact = rec.impact ?? "low";
  const prio = Number(rec.priorityScore ?? 0);
  if (impact === "high" || prio >= 80) return { icon: "🔴", time: "< 5 min" };
  if (impact === "medium" || prio >= 50) return { icon: "⚠️", time: "~15 min" };
  return { icon: "ℹ️", time: "~30 min" };
}

function formatLayerStatus(score) {
  if (score === null || score === undefined) return "—";
  return score < 20
    ? `${score} ✅`
    : score < 40
      ? `${score} ⚠️`
      : `${score} 🔴`;
}

const status = getRiskStatus(total);
const lines = [];

lines.push(`# MergeSignal Scan: Score ${total ?? "—"}/100`);
lines.push(
  `${status.emoji} **${status.label}**${recs.length === 0 ? " — No critical issues" : ""}`,
);
lines.push("");

if (recs.length > 0) {
  lines.push(`## 🎯 Recommended actions (${Math.min(3, recs.length)}):`);
  const topRecs = recs.slice(0, 3);
  for (let i = 0; i < topRecs.length; i++) {
    const rec = topRecs[i];
    const meta = getActionMeta(rec);
    const title = String(rec.title ?? "Review dependencies");
    const pkgs =
      Array.isArray(rec.packages) && rec.packages.length > 0
        ? ` — \`${rec.packages.slice(0, 3).join("`, `")}\`${rec.packages.length > 3 ? `, +${rec.packages.length - 3} more` : ""}`
        : "";
    lines.push(`${i + 1}. ${meta.icon} ${title} (${meta.time})${pkgs}`);
  }
  lines.push("");
} else {
  lines.push("## 🎯 No immediate actions required");
  lines.push("");
}

lines.push("<details>");
lines.push("<summary>📈 Risk breakdown (expand)</summary>");
lines.push("");
lines.push("| Layer | Score | Status |");
lines.push("|-------|-------|--------|");
lines.push(
  `| Security | ${layers.security ?? "—"} | ${formatLayerStatus(layers.security)} |`,
);
lines.push(
  `| Maintainability | ${layers.maintainability ?? "—"} | ${formatLayerStatus(layers.maintainability)} |`,
);
lines.push(
  `| Ecosystem | ${layers.ecosystem ?? "—"} | ${formatLayerStatus(layers.ecosystem)} |`,
);
lines.push(
  `| Upgrade Impact | ${layers.upgradeImpact ?? "—"} | ${formatLayerStatus(layers.upgradeImpact)} |`,
);
lines.push("");

if (gi.nodes || gi.maxDepth) {
  const nodes = gi.nodes ?? "—";
  const depth = gi.maxDepth ?? "—";
  const hotspotCount = Array.isArray(gi.hotspots) ? gi.hotspots.length : 0;
  const vulnCount = Array.isArray(gi.vulnerable) ? gi.vulnerable.length : 0;
  lines.push(
    `**Graph insights**: ${nodes} packages, max depth ${depth}${hotspotCount > 0 ? `, ${hotspotCount} hotspot${hotspotCount > 1 ? "s" : ""}` : ""}${vulnCount > 0 ? `, ${vulnCount} vulnerable` : ""}`,
  );
}

lines.push("</details>");

fs.appendFileSync(summaryPath, `${lines.join("\n")}\n`);
