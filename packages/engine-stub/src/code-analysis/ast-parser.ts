/**
 * AST Parser - Lightweight AST analysis for import extraction
 * 
 * For MVP, uses simple regex-based parsing instead of full AST.
 * This is fast and sufficient for 80% of cases.
 * Future: Can integrate with swc or acorn for more precise analysis.
 */

export type ImportedSymbol = {
  name: string;
  alias?: string;
  isDefault: boolean;
  isNamespace: boolean;
};

export type ImportAnalysis = {
  file: string;
  packageName: string;
  symbols: ImportedSymbol[];
  importType: 'esm' | 'commonjs' | 'dynamic';
  line: number;
};

/**
 * Parse import statements to extract imported symbols.
 * Uses regex-based parsing for speed in MVP.
 * 
 * @param importStatement - The import statement line
 * @param file - File path containing the import
 * @param line - Line number (1-indexed)
 * @returns ImportAnalysis with extracted symbols
 */
export function parseImportSymbols(
  importStatement: string,
  file: string,
  line: number
): ImportAnalysis | null {
  const trimmed = importStatement.trim();
  
  // Extract package name
  const packageMatch = trimmed.match(/(?:from|require\s*\()\s*['"]([^'"]+)['"]/);
  if (!packageMatch) {
    return null;
  }
  
  const packageName = extractPackageNameFromPath(packageMatch[1]);
  if (!packageName) {
    return null;
  }
  
  // Determine import type
  let importType: ImportAnalysis['importType'] = 'esm';
  if (trimmed.includes('require(')) {
    importType = 'commonjs';
  } else if (trimmed.startsWith('import(')) {
    importType = 'dynamic';
  }
  
  // Parse symbols based on import type
  const symbols = importType === 'esm' 
    ? parseESMSymbols(trimmed)
    : parseCJSSymbols(trimmed);
  
  return {
    file,
    packageName,
    symbols,
    importType,
    line,
  };
}

/**
 * Parse ESM import symbols.
 * Handles: import foo from 'pkg', import { a, b as c } from 'pkg', import * as ns from 'pkg'
 */
function parseESMSymbols(importStatement: string): ImportedSymbol[] {
  const symbols: ImportedSymbol[] = [];
  
  // Remove comments and normalize whitespace
  const cleaned = importStatement
    .replace(/\/\/.*$/, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();
  
  // Extract the part before 'from'
  const beforeFrom = cleaned.match(/^import\s+(.*?)\s+from/);
  if (!beforeFrom) {
    return symbols;
  }
  
  const importClause = beforeFrom[1].trim();
  
  // Handle namespace imports: import * as ns from 'pkg'
  const namespaceMatch = importClause.match(/\*\s+as\s+(\w+)/);
  if (namespaceMatch) {
    symbols.push({
      name: namespaceMatch[1],
      isDefault: false,
      isNamespace: true,
    });
    return symbols;
  }
  
  // Handle default import: import foo from 'pkg'
  const defaultMatch = importClause.match(/^(\w+)(?:\s*,)?/);
  if (defaultMatch && !importClause.startsWith('{')) {
    symbols.push({
      name: defaultMatch[1],
      isDefault: true,
      isNamespace: false,
    });
  }
  
  // Handle named imports: import { a, b as c, d } from 'pkg'
  const namedMatch = importClause.match(/\{([^}]+)\}/);
  if (namedMatch) {
    const namedImports = namedMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    
    for (const namedImport of namedImports) {
      // Handle aliases: a as b
      const aliasMatch = namedImport.match(/^(\w+)\s+as\s+(\w+)$/);
      if (aliasMatch) {
        symbols.push({
          name: aliasMatch[1],
          alias: aliasMatch[2],
          isDefault: false,
          isNamespace: false,
        });
      } else {
        symbols.push({
          name: namedImport,
          isDefault: false,
          isNamespace: false,
        });
      }
    }
  }
  
  return symbols;
}

/**
 * Parse CommonJS require symbols.
 * Handles: const foo = require('pkg'), const { a, b } = require('pkg')
 */
function parseCJSSymbols(importStatement: string): ImportedSymbol[] {
  const symbols: ImportedSymbol[] = [];
  
  // Extract the part before require
  const beforeRequire = importStatement.match(/^(?:const|let|var)\s+(.*?)\s*=/);
  if (!beforeRequire) {
    return symbols;
  }
  
  const leftSide = beforeRequire[1].trim();
  
  // Handle destructuring: const { a, b } = require('pkg')
  const destructureMatch = leftSide.match(/\{([^}]+)\}/);
  if (destructureMatch) {
    const destructuredNames = destructureMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    
    for (const name of destructuredNames) {
      // Handle aliases: a: b
      const aliasMatch = name.match(/^(\w+)\s*:\s*(\w+)$/);
      if (aliasMatch) {
        symbols.push({
          name: aliasMatch[1],
          alias: aliasMatch[2],
          isDefault: false,
          isNamespace: false,
        });
      } else {
        symbols.push({
          name: name,
          isDefault: false,
          isNamespace: false,
        });
      }
    }
  } else {
    // Default require: const foo = require('pkg')
    symbols.push({
      name: leftSide,
      isDefault: true,
      isNamespace: false,
    });
  }
  
  return symbols;
}

/**
 * Extract package name from import path.
 * Handles scoped packages and subpath imports.
 */
function extractPackageNameFromPath(importPath: string): string | null {
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

/**
 * Batch parse multiple import statements.
 */
export function parseMultipleImports(
  imports: Array<{ statement: string; file: string; line: number }>
): ImportAnalysis[] {
  const results: ImportAnalysis[] = [];
  
  for (const imp of imports) {
    const parsed = parseImportSymbols(imp.statement, imp.file, imp.line);
    if (parsed) {
      results.push(parsed);
    }
  }
  
  return results;
}

/**
 * Extract all unique symbol names from import analyses.
 */
export function extractUniqueSymbols(analyses: ImportAnalysis[]): string[] {
  const symbols = new Set<string>();
  
  for (const analysis of analyses) {
    for (const symbol of analysis.symbols) {
      // Use alias if present, otherwise use original name
      symbols.add(symbol.alias || symbol.name);
    }
  }
  
  return Array.from(symbols).sort();
}
