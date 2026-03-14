import type {
  LayerScores,
  RiskSignal,
  ScanRequest,
  ScanResult,
  ScoreContribution,
  ScoreLayer,
} from "@reposentinel/shared";

export async function analyze(req: ScanRequest): Promise<ScanResult> {
  const stats = deriveDependencyStats(req.dependencyGraph);
  const signals = buildSignals(stats);
  const layerScores = computeLayerScores(signals);
  const totalScore = computeTotalScore(layerScores);

  return {
    totalScore,
    layerScores,
    findings: buildFindings(stats),
    methodologyVersion: "engine-stub/v1",
    confidence: stats.hasGraphLikeShape ? "medium" : "low",
    signals,
    contributions: signalsToContributions(signals),
    recommendations: buildRecommendations(stats),
    generatedAt: new Date().toISOString(),
  };
}

type DependencyStats = {
  hasGraphLikeShape: boolean;
  nodeCount: number;
  edgeCount: number;
  directDepsCount: number;
  maxDepthEstimate: number;
  duplicateVersionPackages: number;
};

function deriveDependencyStats(input: unknown): DependencyStats {
  const empty: DependencyStats = {
    hasGraphLikeShape: false,
    nodeCount: 0,
    edgeCount: 0,
    directDepsCount: 0,
    maxDepthEstimate: 0,
    duplicateVersionPackages: 0,
  };

  if (!input || typeof input !== "object") return empty;

  const obj = input as Record<string, unknown>;

  const nodesArr = Array.isArray(obj.nodes) ? (obj.nodes as unknown[]) : undefined;
  const edgesArr = Array.isArray(obj.edges) ? (obj.edges as unknown[]) : undefined;

  const deps = (obj.dependencies ??
    obj.deps ??
    obj.packages) as Record<string, unknown> | undefined;

  const nodeCount =
    (nodesArr?.length ?? 0) || (deps && typeof deps === "object" ? Object.keys(deps).length : 0);

  const edgeCount = edgesArr?.length ?? 0;

  const directDepsCount =
    typeof obj.directDependencies === "object" && obj.directDependencies
      ? Object.keys(obj.directDependencies as any).length
      : typeof obj.directDeps === "object" && obj.directDeps
        ? Object.keys(obj.directDeps as any).length
        : 0;

  const versionsByName =
    typeof obj.versionsByName === "object" && obj.versionsByName
      ? (obj.versionsByName as Record<string, unknown>)
      : undefined;

  const duplicateVersionPackages = versionsByName
    ? Object.values(versionsByName).filter((v) => Array.isArray(v) && v.length > 1).length
    : 0;

  const hasGraphLikeShape =
    Boolean(nodesArr) || Boolean(edgesArr) || (deps && typeof deps === "object") || directDepsCount > 0;

  const maxDepthEstimate =
    typeof obj.maxDepth === "number"
      ? Math.max(0, Math.floor(obj.maxDepth))
      : Math.min(12, Math.floor(Math.log2(Math.max(1, nodeCount))));

  return {
    hasGraphLikeShape,
    nodeCount: Math.max(0, nodeCount),
    edgeCount: Math.max(0, edgeCount),
    directDepsCount: Math.max(0, directDepsCount),
    maxDepthEstimate: Math.max(0, maxDepthEstimate),
    duplicateVersionPackages: Math.max(0, duplicateVersionPackages),
  };
}

function buildSignals(stats: DependencyStats): RiskSignal[] {
  const signals: RiskSignal[] = [];

  const add = (
    id: string,
    layer: ScoreLayer,
    name: string,
    value: number,
    weight: number,
    scoreImpact: number,
    evidence?: Record<string, unknown>,
  ) => {
    signals.push({
      id,
      layer,
      name,
      value,
      weight,
      scoreImpact,
      evidence,
    });
  };

  add(
    "graph.transitive_volume",
    "maintainability",
    "Transitive dependency volume",
    stats.nodeCount,
    1,
    clampScore((stats.nodeCount / 200) * 35),
    { nodeCount: stats.nodeCount },
  );

  add(
    "graph.depth",
    "maintainability",
    "Dependency depth",
    stats.maxDepthEstimate,
    1,
    clampScore((stats.maxDepthEstimate / 10) * 25),
    { maxDepthEstimate: stats.maxDepthEstimate },
  );

  add(
    "graph.duplicates",
    "upgradeImpact",
    "Duplicate versions across packages",
    stats.duplicateVersionPackages,
    1,
    clampScore((stats.duplicateVersionPackages / 25) * 30),
    { duplicateVersionPackages: stats.duplicateVersionPackages },
  );

  add(
    "input.coverage",
    "security",
    "Input coverage confidence penalty",
    stats.hasGraphLikeShape ? 1 : 0,
    1,
    stats.hasGraphLikeShape ? 0 : 25,
    { hasGraphLikeShape: stats.hasGraphLikeShape },
  );

  add(
    "upgrade.direct_deps_count",
    "upgradeImpact",
    "Direct dependencies count",
    stats.directDepsCount,
    1,
    clampScore((stats.directDepsCount / 80) * 20),
    { directDepsCount: stats.directDepsCount },
  );

  add(
    "ecosystem.package_surface",
    "ecosystem",
    "Package surface area",
    stats.nodeCount,
    1,
    clampScore((stats.nodeCount / 250) * 20),
    { nodeCount: stats.nodeCount },
  );

  return signals;
}

function computeLayerScores(signals: RiskSignal[]): LayerScores {
  const base: LayerScores = {
    security: 0,
    maintainability: 0,
    ecosystem: 0,
    upgradeImpact: 0,
  };

  for (const s of signals) {
    base[s.layer] = clampScore(base[s.layer] + s.scoreImpact);
  }

  return base;
}

function computeTotalScore(layerScores: LayerScores): number {
  const weights: Record<ScoreLayer, number> = {
    security: 0.35,
    maintainability: 0.25,
    ecosystem: 0.15,
    upgradeImpact: 0.25,
  };

  let sum = 0;
  for (const layer of Object.keys(weights) as ScoreLayer[]) {
    sum += layerScores[layer] * weights[layer];
  }
  return clampScore(sum);
}

function signalsToContributions(signals: RiskSignal[]): ScoreContribution[] {
  return signals.map((s) => ({
    id: s.id,
    layer: s.layer,
    scoreImpact: s.scoreImpact,
    evidence: s.evidence,
  }));
}

function buildFindings(stats: DependencyStats) {
  if (!stats.hasGraphLikeShape) {
    return [
      {
        id: "missing-input",
        title: "Limited input; confidence reduced",
        description:
          "No dependency graph or lockfile-derived graph was provided. Scores are conservative and based on minimal heuristics.",
        severity: "medium" as const,
        packageName: "repository",
        recommendation: "Provide a lockfile (pnpm-lock.yaml or package-lock.json) for deeper analysis.",
      },
    ];
  }

  return [
    {
      id: "engine-v1",
      title: "Explainable scoring enabled",
      description: "This scan includes per-signal score contributions and a methodology version.",
      severity: "low" as const,
      packageName: "repository",
    },
  ];
}

function buildRecommendations(stats: DependencyStats) {
  const recs = [];
  if (!stats.hasGraphLikeShape) {
    recs.push({
      id: "provide-lockfile",
      title: "Add lockfile input for higher-fidelity results",
      rationale: "Lockfile parsing enables transitive graph intelligence and upgrade impact analysis.",
      impact: "high" as const,
    });
    return recs;
  }

  if (stats.duplicateVersionPackages > 0) {
    recs.push({
      id: "dedupe-versions",
      title: "Reduce duplicate dependency versions",
      rationale: "Fewer duplicate versions lowers upgrade complexity and reduces bundle/runtime surface area.",
      impact: stats.duplicateVersionPackages > 10 ? ("high" as const) : ("medium" as const),
    });
  }

  if (stats.maxDepthEstimate >= 6) {
    recs.push({
      id: "flatten-graph",
      title: "Flatten dependency depth",
      rationale: "Shallower graphs reduce hidden transitive risk and simplify upgrades.",
      impact: "medium" as const,
    });
  }

  return recs;
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}