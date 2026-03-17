export { analyze } from "./analyze.js";
export { simulateUpgrade } from "./simulateUpgrade.js";

// Code analysis exports
export {
  analyzePackageUsage,
  analyzeMultiplePackageUsage,
  analyzePackageUsageDetailed,
  buildFileContentsMap,
  type DetailedUsageReport,
} from "./code-analysis/usage-mapper.js";

export {
  scanForImports,
  scanForMultipleImports,
  extractPackageName,
  type ImportLocation,
  type ImportScanResult,
} from "./code-analysis/import-scanner.js";

export {
  parseImportSymbols,
  parseMultipleImports,
  extractUniqueSymbols,
  type ImportedSymbol,
  type ImportAnalysis,
} from "./code-analysis/ast-parser.js";

export {
  assessCriticalPath,
  categorizeFilesByCriticality,
  extractCriticalPathIndicators,
} from "./code-analysis/critical-path.js";
