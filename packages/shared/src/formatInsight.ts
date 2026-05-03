import type {
  PRInsight,
  PRDecision,
  PRDecisionRecommendation,
} from "./types.js";

// Per-insight structured data — no title (title is per-comment, not per-insight)
export type FormattedInsight = {
  message: string;
  where: string;
  action: string;
};

const DECISION_TITLES: Record<PRDecisionRecommendation, string> = {
  safe: "No significant dependency risks detected",
  needs_review: "Elevated dependency merge risk",
  risky: "Merge blocked — critical dependency risk",
};

// Title rendered once per PR comment, not per insight
export function decisionTitle(
  recommendation: PRDecisionRecommendation,
): string {
  return DECISION_TITLES[recommendation];
}

// Maps one PRInsight to its display fields (no title)
export function formatInsight(insight: PRInsight): FormattedInsight {
  return {
    message: insight.message,
    where: insight.context,
    action: insight.remediation,
  };
}

// Renders a single formatted insight as markdown (no title, no divider)
function renderInsightAsMarkdown(f: FormattedInsight): string {
  return [
    f.message,
    "",
    "**Where it shows up**",
    "",
    f.where,
    "",
    "**What to do**",
    "",
    f.action,
  ].join("\n");
}

// Renders a full PR comment: one bold title + all insights separated by dividers
export function renderInsightsAsMarkdown(
  insights: PRInsight[],
  decision: PRDecision,
): string {
  const title = `**${decisionTitle(decision.recommendation)}**`;
  const blocks = insights.map((insight) =>
    renderInsightAsMarkdown(formatInsight(insight)),
  );
  return [title, "", ...blocks].join("\n\n---\n\n").trimEnd();
}
