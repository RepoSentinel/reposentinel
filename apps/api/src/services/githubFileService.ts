export function filterRelevantSourceFiles(changedFiles: string[]): string[] {
  const SOURCE_EXTENSIONS = new Set([
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".mjs",
    ".cjs",
    ".mts",
    ".cts",
  ]);

  const IGNORED_PATTERNS = [
    /node_modules\//,
    /\.test\./,
    /\.spec\./,
    /\/__tests__\//,
    /^test\//,
    /^tests\//,
    /\/test\//,
    /\/tests\//,
    /\.d\.ts$/,
  ];

  return changedFiles.filter((file) => {
    const ext = file.substring(file.lastIndexOf("."));
    if (!SOURCE_EXTENSIONS.has(ext)) return false;

    for (const pattern of IGNORED_PATTERNS) {
      if (pattern.test(file)) return false;
    }

    return true;
  });
}
