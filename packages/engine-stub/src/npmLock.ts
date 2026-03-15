import { computeGraphMetrics } from "./graphMetrics.js";
import type { DependencyGraph, DepNodeId } from "./pnpmLock.js";

type PackageLockV1 = {
  lockfileVersion?: number;
  dependencies?: Record<
    string,
    { version?: string; requires?: Record<string, string>; dependencies?: any }
  >;
};

type PackageLockV2 = {
  lockfileVersion?: number;
  packages?: Record<
    string,
    {
      version?: string;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      optionalDependencies?: Record<string, string>;
    }
  >;
};

export function graphFromPackageLock(lockfileJson: string): DependencyGraph {
  const doc = JSON.parse(lockfileJson) as PackageLockV1 & PackageLockV2;
  const v = Number(doc?.lockfileVersion ?? 0);
  if (v >= 2 && doc.packages && typeof doc.packages === "object") {
    return fromPackagesField(doc as PackageLockV2);
  }
  return fromV1Dependencies(doc as PackageLockV1);
}

function fromPackagesField(doc: PackageLockV2): DependencyGraph {
  const packages = doc.packages ?? {};

  const nodes = new Map<DepNodeId, { id: DepNodeId; name: string; version: string }>();
  const edges: Array<{ from: DepNodeId; to: DepNodeId }> = [];

  const byPath = new Map<string, { name: string; version: string; id: string }>();
  const pathsByName = new Map<string, string[]>();

  for (const [p, meta] of Object.entries(packages)) {
    if (!p || p === "") continue;
    const name = nameFromNodeModulesPath(p);
    const version = typeof meta?.version === "string" ? meta.version : "";
    if (!name || !version) continue;
    const id = `${name}@${version}`;
    if (!nodes.has(id)) nodes.set(id, { id, name, version });
    byPath.set(p, { name, version, id });
    const arr = pathsByName.get(name);
    if (arr) arr.push(p);
    else pathsByName.set(name, [p]);
  }

  // Sort paths so we can prefer the closest ancestor.
  for (const [name, ps] of pathsByName.entries()) {
    ps.sort((a, b) => a.length - b.length);
    pathsByName.set(name, ps);
  }

  const root = packages[""] ?? {};
  const directDeps = resolvedDirectDepsFromRoot(root, byPath, pathsByName);

  for (const [p, meta] of Object.entries(packages)) {
    if (!p || p === "") continue;
    const from = byPath.get(p);
    if (!from) continue;
    const deps = meta?.dependencies ?? {};
    for (const depName of Object.keys(deps)) {
      const toId = resolveInstalledDepId(p, depName, byPath, pathsByName);
      if (!toId) continue;
      edges.push({ from: from.id, to: toId });
    }
  }

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

function fromV1Dependencies(doc: PackageLockV1): DependencyGraph {
  const nodes = new Map<DepNodeId, { id: DepNodeId; name: string; version: string }>();
  const edges: Array<{ from: DepNodeId; to: DepNodeId }> = [];
  const directDeps: Record<string, string> = {};

  const deps = doc.dependencies ?? {};
  for (const [name, meta] of Object.entries(deps)) {
    const version = typeof meta?.version === "string" ? meta.version : "";
    if (!name || !version) continue;
    directDeps[name] = version;
  }

  const ensure = (name: string, version: string) => {
    const id = `${name}@${version}`;
    if (!nodes.has(id)) nodes.set(id, { id, name, version });
    return id;
  };

  const visit = (name: string, meta: any) => {
    const version = typeof meta?.version === "string" ? meta.version : "";
    if (!name || !version) return;
    const fromId = ensure(name, version);
    const childDeps = meta?.dependencies ?? {};
    for (const [childName, childMeta] of Object.entries(childDeps)) {
      const childVersion = typeof (childMeta as any)?.version === "string" ? (childMeta as any).version : "";
      if (!childName || !childVersion) continue;
      const toId = ensure(childName, childVersion);
      edges.push({ from: fromId, to: toId });
      visit(childName, childMeta);
    }
  };

  for (const [name, meta] of Object.entries(deps)) visit(name, meta);

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

function resolvedDirectDepsFromRoot(
  root: any,
  byPath: Map<string, { name: string; version: string; id: string }>,
  pathsByName: Map<string, string[]>,
) {
  const all = {
    ...(root?.dependencies ?? {}),
    ...(root?.devDependencies ?? {}),
    ...(root?.optionalDependencies ?? {}),
  } as Record<string, string>;

  const out: Record<string, string> = {};
  for (const name of Object.keys(all)) {
    const id = resolveInstalledDepId("", name, byPath, pathsByName);
    if (!id) continue;
    const at = id.lastIndexOf("@");
    out[name] = id.slice(at + 1);
  }
  return out;
}

function resolveInstalledDepId(
  fromPath: string,
  depName: string,
  byPath: Map<string, { name: string; version: string; id: string }>,
  pathsByName: Map<string, string[]>,
) {
  // Try nearest ancestor (npm's nested node_modules layout).
  const candidates = pathsByName.get(depName) ?? [];
  if (!candidates.length) return null;

  const tryPaths: string[] = [];
  if (fromPath) {
    let cur = fromPath;
    while (cur) {
      const p = joinPath(cur, "node_modules", depName);
      tryPaths.push(p);
      const idx = cur.lastIndexOf("/node_modules/");
      if (idx < 0) break;
      cur = cur.slice(0, idx);
    }
  }
  // Fall back to top-level.
  tryPaths.push(joinPath("node_modules", depName));

  for (const p of tryPaths) {
    const hit = byPath.get(p);
    if (hit) return hit.id;
  }

  // Last resort: pick the shortest path for that name.
  const p0 = candidates[0];
  const hit = p0 ? byPath.get(p0) : null;
  return hit ? hit.id : null;
}

function joinPath(...parts: string[]) {
  return parts.filter(Boolean).join("/");
}

function nameFromNodeModulesPath(p: string) {
  // examples:
  // node_modules/react
  // node_modules/@types/node
  // node_modules/a/node_modules/b
  const idx = p.lastIndexOf("node_modules/");
  if (idx < 0) return null;
  const rest = p.slice(idx + "node_modules/".length);
  if (!rest) return null;
  if (rest.startsWith("@")) {
    const [scope, name] = rest.split("/").slice(0, 2);
    if (!scope || !name) return null;
    return `${scope}/${name}`;
  }
  const [name] = rest.split("/");
  return name || null;
}

