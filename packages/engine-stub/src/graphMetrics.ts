import type { DepNodeId, DependencyGraph } from "./pnpmLock.js";

export function computeGraphMetrics(opts: {
  nodes: Array<{ id: DepNodeId; name: string; version: string }>;
  edges: Array<{ from: DepNodeId; to: DepNodeId }>;
  directDeps: Record<string, string>;
}) {
  const nodesById = new Map<string, { id: string; name: string; version: string }>();
  const versionsByName = new Map<string, Set<string>>();
  for (const n of opts.nodes) {
    nodesById.set(n.id, n);
    let set = versionsByName.get(n.name);
    if (!set) {
      set = new Set<string>();
      versionsByName.set(n.name, set);
    }
    set.add(n.version);
  }

  const maxDepth = estimateMaxDepth(opts.edges, Object.entries(opts.directDeps).map(([n, v]) => `${n}@${v}`));
  const fanInTop = computeTopFanIn(nodesById, opts.edges, 10);
  const blastRadiusTop = computeTopBlastRadius(
    nodesById,
    opts.edges,
    Object.entries(opts.directDeps).map(([n, v]) => `${n}@${v}`),
    10,
  );

  return {
    maxDepth,
    fanInTop,
    blastRadiusTop,
    versionsByName: Object.fromEntries(
      Array.from(versionsByName.entries()).map(([k, v]) => [k, Array.from(v.values()).sort()]),
    ),
  } satisfies Pick<DependencyGraph, "maxDepth" | "fanInTop" | "blastRadiusTop" | "versionsByName">;
}

function estimateMaxDepth(edges: Array<{ from: string; to: string }>, roots: string[]): number {
  if (!roots.length) return 0;
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    const a = adj.get(e.from);
    if (a) a.push(e.to);
    else adj.set(e.from, [e.to]);
  }

  const visited = new Set<string>();
  let max = 0;

  const stack: Array<{ id: string; depth: number }> = roots.map((id) => ({ id, depth: 1 }));
  while (stack.length) {
    const cur = stack.pop()!;
    if (cur.depth > max) max = cur.depth;
    if (cur.depth > 100) continue;
    const key = `${cur.id}@${cur.depth}`;
    if (visited.has(key)) continue;
    visited.add(key);
    const next = adj.get(cur.id);
    if (!next) continue;
    for (const n of next) stack.push({ id: n, depth: cur.depth + 1 });
  }

  return max;
}

function computeTopFanIn(
  nodes: Map<string, { id: string; name: string; version: string }>,
  edges: Array<{ from: string; to: string }>,
  limit: number,
) {
  const fanIn = new Map<string, number>();
  for (const e of edges) fanIn.set(e.to, (fanIn.get(e.to) ?? 0) + 1);

  const ranked = Array.from(fanIn.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, count]) => {
      const n = nodes.get(id);
      return n ? { id, name: n.name, version: n.version, fanIn: count } : null;
    })
    .filter(Boolean) as Array<{ id: string; name: string; version: string; fanIn: number }>;

  return ranked;
}

function computeTopBlastRadius(
  nodes: Map<string, { id: string; name: string; version: string }>,
  edges: Array<{ from: string; to: string }>,
  roots: string[],
  limit: number,
) {
  if (!roots.length) return [];
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    const a = adj.get(e.from);
    if (a) a.push(e.to);
    else adj.set(e.from, [e.to]);
  }

  const reachCount = new Map<string, number>();

  for (const root of roots) {
    const seen = new Set<string>();
    const stack = [root];
    while (stack.length) {
      const cur = stack.pop()!;
      if (seen.has(cur)) continue;
      seen.add(cur);
      reachCount.set(cur, (reachCount.get(cur) ?? 0) + 1);
      const next = adj.get(cur);
      if (!next) continue;
      for (const n of next) stack.push(n);
    }
  }

  const ranked = Array.from(reachCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, rootsCount]) => {
      const n = nodes.get(id);
      return n ? { id, name: n.name, version: n.version, roots: rootsCount } : null;
    })
    .filter(Boolean) as Array<{ id: string; name: string; version: string; roots: number }>;

  return ranked;
}

