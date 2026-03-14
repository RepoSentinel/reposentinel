import type { ExplainReason, RiskSignal, ScoreLayer } from "@reposentinel/shared";

const DEFAULT_MAX = 6;

export function explainFromSignals(signals: RiskSignal[], { max = DEFAULT_MAX }: { max?: number } = {}) {
  const byId = new Map<string, RiskSignal>();
  for (const s of signals) {
    if (!s?.id) continue;
    // Keep highest impact if duplicates exist.
    const prev = byId.get(s.id);
    if (!prev || Number(s.scoreImpact ?? 0) > Number(prev.scoreImpact ?? 0)) byId.set(s.id, s);
  }

  const important = Array.from(byId.values())
    .filter((s) => Number(s.scoreImpact ?? 0) > 0)
    .sort((a, b) => Number(b.scoreImpact ?? 0) - Number(a.scoreImpact ?? 0));

  const picked = pickDiversified(important, max);

  const reasons: ExplainReason[] = picked.map((s) => ({
    id: s.id,
    layer: s.layer as ScoreLayer,
    title: humanizeReasonTitle(s),
    value: typeof s.value === "number" ? s.value : undefined,
    scoreImpact: Number(s.scoreImpact ?? 0),
    evidence: s.evidence,
  }));

  return { reasons };
}

function pickDiversified(signals: RiskSignal[], max: number) {
  const out: RiskSignal[] = [];
  const perLayerCount: Record<string, number> = {};

  for (const s of signals) {
    if (out.length >= max) break;
    const layer = String(s.layer ?? "");
    perLayerCount[layer] = perLayerCount[layer] ?? 0;

    // Avoid a “security-only” wall; keep a soft per-layer cap.
    const cap = layer === "security" ? 3 : 2;
    if (perLayerCount[layer] >= cap) continue;

    out.push(s);
    perLayerCount[layer] += 1;
  }

  // If diversification filtered too much, fill remaining slots.
  if (out.length < max) {
    for (const s of signals) {
      if (out.length >= max) break;
      if (out.some((x) => x.id === s.id)) continue;
      out.push(s);
    }
  }

  return out.slice(0, max);
}

function humanizeReasonTitle(s: RiskSignal) {
  // For UX: use the authored signal name, but normalize some verbose names.
  const name = String(s.name ?? s.id ?? "Reason").trim();
  return name || String(s.id ?? "Reason");
}

