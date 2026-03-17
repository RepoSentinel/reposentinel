/**
 * Code Analysis Module
 * 
 * Provides code usage scanning and analysis for dependency impact detection.
 * 
 * Main entry points:
 * - analyzePackageUsage() - Analyze how a single package is used
 * - analyzeMultiplePackageUsage() - Analyze multiple packages in parallel
 * - assessCriticalPath() - Determine if files are in critical code paths
 * 
 * Implementation follows the architecture plan:
 * - Fast import scanning using regex patterns
 * - Lightweight AST parsing for symbol extraction
 * - Heuristic-based critical path detection
 */

export {
  analyzePackageUsage,
  analyzeMultiplePackageUsage,
  analyzePackageUsageDetailed,
  buildFileContentsMap,
  type DetailedUsageReport,
} from "./usage-mapper.js";

export {
  scanForImports,
  scanForMultipleImports,
  extractPackageName,
  type ImportLocation,
  type ImportScanResult,
} from "./import-scanner.js";

export {
  parseImportSymbols,
  parseMultipleImports,
  extractUniqueSymbols,
  type ImportedSymbol,
  type ImportAnalysis,
} from "./ast-parser.js";

export {
  assessCriticalPath,
  categorizeFilesByCriticality,
  extractCriticalPathIndicators,
} from "./critical-path.js";
