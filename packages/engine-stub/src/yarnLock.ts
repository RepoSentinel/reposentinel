import lockfile from "@yarnpkg/lockfile";
import { computeGraphMetrics } from "./graphMetrics.js";
import type { DependencyGraph, DepNodeId } from "./pnpmLock.js";

type YarnEntry = {
  version?: string;
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

export function graphFromYarnLock(lockfileText: string): DependencyGraph {
  const parsed = (lockfile as any).parse(lockfileText);
  if ((parsed as any)?.type !== "success" || !(parsed as any)?.object) {
    return emptyGraph();
  }

  const obj = (parsed as any).object as Record<string, YarnEntry>;

  const nodes = new Map<DepNodeId, { id: DepNodeId; name: string; version: string }>();
  const edges: Array<{ from: DepNodeId; to: DepNodeId }> = [];

  const selectorToId = new Map<string, DepNodeId>();
  const selectorsByName = new Map<string, string[]>();

  for (const [key, entry] of Object.entries(obj)) {
    const version = typeof entry?.version === "string" ? entry.version : "";
    if (!version) continue;

    const selectors = key
      .split(/,(?![^"]*")/)
      .map((s) => s.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);

    for (const sel of selectors) {
      const name = nameFromYarnSelector(sel);
      if (!name) continue;
      const id = `${name}@${version}`;
      if (!nodes.has(id)) nodes.set(id, { id, name, version });
      selectorToId.set(sel, id);
      const arr = selectorsByName.get(name);
      if (arr) arr.push(sel);
      else selectorsByName.set(name, [sel]);
    }
  }

  for (const [key, entry] of Object.entries(obj)) {
    const version = typeof entry?.version === "string" ? entry.version : "";
    if (!version) continue;

    const firstSel = key.split(",")[0]?.trim().replace(/^"|"$/g, "");
    const fromName = firstSel ? nameFromYarnSelector(firstSel) : null;
    if (!fromName) continue;
    const fromId = `${fromName}@${version}`;
    if (!nodes.has(fromId)) continue;

    const deps = { ...(entry.dependencies ?? {}), ...(entry.optionalDependencies ?? {}) };
    for (const [depName, range] of Object.entries(deps)) {
      const exact = `${depName}@${range}`;
      const toId =
        selectorToId.get(exact) ??
        // fallback: any selector for that name
        (selectorsByName.get(depName)?.[0] ? selectorToId.get(selectorsByName.get(depName)![0]!) : undefined);
      if (!toId) continue;
      edges.push({ from: fromId, to: toId });
    }
  }

  // yarn.lock doesn't tell "direct deps" without package.json; keep empty so we don't claim direct changes.
  const directDeps: Record<string, string> = {};
  const metrics = computeGraphMetrics({ nodes: Array.from(nodes.values()), edges, directDeps });

  return {
    nodes: Array.from(nodes.values()),
    edges,
    directDeps,
    versionsByName: metrics.versionsByName,
    maxDepth: metrics.maxDepth,
    fanInTop: metrics.fanInTop,
    blastRadiusTop: metrics.blastRadiusTop,
  };
}

function emptyGraph(): DependencyGraph {
  return {
    nodes: [],
    edges: [],
    directDeps: {},
    versionsByName: {},
    maxDepth: 0,
    fanInTop: [],
    blastRadiusTop: [],
  };
}

function nameFromYarnSelector(sel: string) {
  const s = sel.trim();
  const at = s.lastIndexOf("@");
  if (at <= 0) return null;
  return s.slice(0, at);
}

