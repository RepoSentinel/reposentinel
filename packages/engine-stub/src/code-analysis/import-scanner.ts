/**
 * Import Scanner - Fast file search for package imports
 * 
 * Uses simple text search to find all files importing a specific package.
 * MVP implementation focuses on speed over precision.
 */

export type ImportLocation = {
  file: string;
  line: number;
  importStatement: string;
};

export type ImportScanResult = {
  packageName: string;
  filesWithImports: string[];
  locations: ImportLocation[];
  totalImports: number;
};

/**
 * Find all files that import a specific package.
 * 
 * For MVP, this uses simple string matching on file contents.
 * Future: Could integrate with ripgrep or similar for better performance.
 * 
 * @param fileContents - Map of file paths to their contents
 * @param packageName - Package to search for
 * @returns Scan result with all import locations
 */
export function scanForImports(
  fileContents: Map<string, string>,
  packageName: string
): ImportScanResult {
  const locations: ImportLocation[] = [];
  const filesWithImports = new Set<string>();
  
  // Common import patterns to match
  // Note: We don't use 'g' flag to avoid lastIndex issues
  const patterns = [
    // ESM imports (including type imports)
    new RegExp(`from\\s+['"]${escapeRegex(packageName)}['"]`),
    new RegExp(`from\\s+['"]${escapeRegex(packageName)}/[^'"]*['"]`),
    // CommonJS require
    new RegExp(`require\\s*\\(\\s*['"]${escapeRegex(packageName)}['"]\\s*\\)`),
    new RegExp(`require\\s*\\(\\s*['"]${escapeRegex(packageName)}/[^'"]*['"]\\s*\\)`),
    // Dynamic imports
    new RegExp(`import\\s*\\(\\s*['"]${escapeRegex(packageName)}['"]\\s*\\)`),
    new RegExp(`import\\s*\\(\\s*['"]${escapeRegex(packageName)}/[^'"]*['"]\\s*\\)`),
  ];
  
  for (const [filePath, content] of fileContents.entries()) {
    // Skip non-source files
    if (!isSourceFile(filePath)) {
      continue;
    }
    
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of patterns) {
        if (pattern.test(line)) {
          locations.push({
            file: filePath,
            line: i + 1, // 1-indexed
            importStatement: line.trim(),
          });
          
          filesWithImports.add(filePath);
          break; // Found in this line, move to next line
        }
      }
    }
  }
  
  return {
    packageName,
    filesWithImports: Array.from(filesWithImports).sort(),
    locations,
    totalImports: locations.length,
  };
}

/**
 * Scan for imports across multiple packages.
 * Returns a map of package name to scan results.
 */
export function scanForMultipleImports(
  fileContents: Map<string, string>,
  packageNames: string[]
): Map<string, ImportScanResult> {
  const results = new Map<string, ImportScanResult>();
  
  for (const packageName of packageNames) {
    results.set(packageName, scanForImports(fileContents, packageName));
  }
  
  return results;
}

/**
 * Check if a file is a source file we should scan.
 * Filters out node_modules, build outputs, etc.
 */
function isSourceFile(filePath: string): boolean {
  // Exclude patterns
  const excludePatterns = [
    /node_modules\//,
    /\.git\//,
    /dist\//,
    /build\//,
    /out\//,
    /coverage\//,
    /\.next\//,
    /\.nuxt\//,
    /\.vite\//,
    /\.turbo\//,
  ];
  
  if (excludePatterns.some(pattern => pattern.test(filePath))) {
    return false;
  }
  
  // Include patterns - source file extensions
  const sourceExtensions = [
    '.ts', '.tsx', '.js', '.jsx', 
    '.mjs', '.cjs', '.mts', '.cts',
    '.vue', '.svelte',
  ];
  
  return sourceExtensions.some(ext => filePath.endsWith(ext));
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract package name from import statement.
 * Handles scoped packages and subpath imports.
 * 
 * @example
 * extractPackageName("import { foo } from '@scope/pkg/sub'") // "@scope/pkg"
 * extractPackageName("import x from 'express'") // "express"
 */
export function extractPackageName(importStatement: string): string | null {
  // Match quoted strings in from/require clauses
  const match = importStatement.match(/(?:from|require\s*\()\s*['"]([^'"]+)['"]/);
  
  if (!match) {
    return null;
  }
  
  const importPath = match[1];
  
  // Handle scoped packages (@scope/package)
  if (importPath.startsWith('@')) {
    const parts = importPath.split('/');
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
  }
  
  // Handle regular packages
  const firstPart = importPath.split('/')[0];
  return firstPart || null;
}
