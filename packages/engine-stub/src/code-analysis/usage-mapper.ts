/**
 * Usage Mapper - Map package imports to actual usage patterns
 * 
 * Coordinates import scanning, AST parsing, and critical path detection
 * to produce comprehensive usage reports for packages.
 */

import type { UsageReport } from "@mergesignal/shared";
import { scanForImports, type ImportScanResult } from "./import-scanner.js";
import { parseImportSymbols, extractUniqueSymbols, type ImportAnalysis } from "./ast-parser.js";
import { assessCriticalPath, extractCriticalPathIndicators } from "./critical-path.js";

/**
 * Analyze how a package is used in the codebase.
 * 
 * This is the main entry point for code usage analysis.
 * It coordinates:
 * 1. Import scanning (find all files using the package)
 * 2. Symbol extraction (what APIs are imported)
 * 3. Critical path detection (is this in risky code?)
 * 
 * @param fileContents - Map of file paths to their contents
 * @param packageName - Package to analyze
 * @returns Usage report with files, symbols, and critical path analysis
 */
export async function analyzePackageUsage(
  fileContents: Map<string, string>,
  packageName: string
): Promise<UsageReport> {
  // 1. Scan for imports
  const importScan = scanForImports(fileContents, packageName);
  
  // 2. Parse import statements to extract symbols
  const importAnalyses: ImportAnalysis[] = [];
  for (const location of importScan.locations) {
    const analysis = parseImportSymbols(
      location.importStatement,
      location.file,
      location.line
    );
    if (analysis) {
      importAnalyses.push(analysis);
    }
  }
  
  // 3. Extract unique symbols
  const importedSymbols = extractUniqueSymbols(importAnalyses);
  
  // 4. Extract critical paths from files
  const criticalPathIndicators = new Set<string>();
  for (const file of importScan.filesWithImports) {
    const indicators = extractCriticalPathIndicators(file);
    indicators.forEach(ind => criticalPathIndicators.add(ind));
  }
  
  // 5. Build usage report
  return {
    filesUsingPackage: importScan.filesWithImports,
    importedSymbols,
    criticalPaths: Array.from(criticalPathIndicators).sort(),
    usageCount: importScan.totalImports,
  };
}

/**
 * Analyze usage for multiple packages in parallel.
 * Returns a map of package name to usage report.
 */
export async function analyzeMultiplePackageUsage(
  fileContents: Map<string, string>,
  packageNames: string[]
): Promise<Map<string, UsageReport>> {
  const results = await Promise.all(
    packageNames.map(async (packageName) => {
      const report = await analyzePackageUsage(fileContents, packageName);
      return { packageName, report } as const;
    })
  );
  
  const map = new Map<string, UsageReport>();
  for (const { packageName, report } of results) {
    map.set(packageName, report);
  }
  
  return map;
}

/**
 * Analyze package usage with detailed breakdown.
 * Includes additional metadata for debugging and insights.
 */
export type DetailedUsageReport = UsageReport & {
  importAnalyses: ImportAnalysis[];
  criticalPathScore: number;
  isCritical: boolean;
  categoryBreakdown: {
    totalFiles: number;
    esmImports: number;
    commonjsImports: number;
    dynamicImports: number;
  };
};

export async function analyzePackageUsageDetailed(
  fileContents: Map<string, string>,
  packageName: string
): Promise<DetailedUsageReport> {
  // Get basic usage report
  const basicReport = await analyzePackageUsage(fileContents, packageName);
  
  // Re-scan for detailed analysis
  const importScan = scanForImports(fileContents, packageName);
  const importAnalyses: ImportAnalysis[] = [];
  
  for (const location of importScan.locations) {
    const analysis = parseImportSymbols(
      location.importStatement,
      location.file,
      location.line
    );
    if (analysis) {
      importAnalyses.push(analysis);
    }
  }
  
  // Assess critical path
  const criticalPath = assessCriticalPath(importScan.filesWithImports);
  
  // Category breakdown
  const esmImports = importAnalyses.filter(a => a.importType === 'esm').length;
  const commonjsImports = importAnalyses.filter(a => a.importType === 'commonjs').length;
  const dynamicImports = importAnalyses.filter(a => a.importType === 'dynamic').length;
  
  return {
    ...basicReport,
    importAnalyses,
    criticalPathScore: criticalPath.score,
    isCritical: criticalPath.isCritical,
    categoryBreakdown: {
      totalFiles: importScan.filesWithImports.length,
      esmImports,
      commonjsImports,
      dynamicImports,
    },
  };
}

/**
 * Build a file contents map from an array of file entries.
 * Helper function for testing and integration.
 */
export function buildFileContentsMap(
  files: Array<{ path: string; content: string }>
): Map<string, string> {
  const map = new Map<string, string>();
  for (const file of files) {
    map.set(file.path, file.content);
  }
  return map;
}
