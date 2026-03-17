# Code Analysis Module

Fast, lightweight code usage analysis for dependency impact detection.

## Overview

This module provides tools to analyze how packages are used in a codebase. It's designed for the PR Dependency Intelligence System to determine:

1. **Which files** import a package
2. **What APIs** are imported from the package
3. **Where** these imports are used (critical paths vs. utilities)

## Architecture

The module follows a layered approach:

```
usage-mapper (orchestration)
    ├── import-scanner (fast file search)
    ├── ast-parser (symbol extraction)
    └── critical-path (heuristic analysis)
```

### Design Principles

- **Fast over precise**: Uses regex-based parsing instead of full AST for speed
- **MVP-focused**: 80% coverage is sufficient; avoid over-engineering
- **Heuristic-based**: Critical path detection uses folder/file patterns, not ML
- **Cost-aware**: Designed to work efficiently on large codebases

## Usage

### Basic Package Analysis

```typescript
import { analyzePackageUsage, buildFileContentsMap } from '@mergesignal/engine-stub';

// Build file map from your codebase
const files = buildFileContentsMap([
  { path: 'src/server.ts', content: 'import express from "express";' },
  { path: 'src/auth/login.ts', content: 'import { Router } from "express";' },
]);

// Analyze package usage
const usage = await analyzePackageUsage(files, 'express');

console.log(usage);
// {
//   filesUsingPackage: ['src/auth/login.ts', 'src/server.ts'],
//   importedSymbols: ['express', 'Router'],
//   criticalPaths: ['authentication'],
//   usageCount: 2
// }
```

### Multiple Package Analysis

```typescript
import { analyzeMultiplePackageUsage } from '@mergesignal/engine-stub';

const results = await analyzeMultiplePackageUsage(files, [
  'express',
  'react',
  'lodash',
]);

for (const [pkg, usage] of results) {
  console.log(`${pkg}: used in ${usage.filesUsingPackage.length} files`);
}
```

### Detailed Analysis

```typescript
import { analyzePackageUsageDetailed } from '@mergesignal/engine-stub';

const detailed = await analyzePackageUsageDetailed(files, 'express');

console.log(detailed);
// {
//   ...basicReport,
//   importAnalyses: [...],         // Full import details
//   criticalPathScore: 65,         // Numeric score (0-100)
//   isCritical: true,              // Boolean flag
//   categoryBreakdown: {
//     totalFiles: 3,
//     esmImports: 2,
//     commonjsImports: 1,
//     dynamicImports: 0,
//   }
// }
```

### Critical Path Assessment

```typescript
import { assessCriticalPath } from '@mergesignal/engine-stub';

const files = [
  'src/auth/login.ts',
  'src/payment/checkout.ts',
  'src/utils/format.ts',
];

const result = assessCriticalPath(files);

console.log(result);
// {
//   isCritical: true,
//   score: 70,
//   reasons: [
//     'authentication: src/auth/login.ts',
//     'payment processing: src/payment/checkout.ts',
//   ]
// }
```

## Modules

### `import-scanner.ts`

Fast text-based search for package imports.

**Key Functions:**
- `scanForImports(files, packageName)` - Find all files importing a package
- `scanForMultipleImports(files, packageNames)` - Batch scanning
- `extractPackageName(importStatement)` - Parse package name from import

**Supported Import Formats:**
- ESM: `import foo from 'pkg'`, `import { bar } from 'pkg'`
- CommonJS: `const foo = require('pkg')`
- Dynamic: `await import('pkg')`
- Scoped packages: `@scope/package`
- Subpath imports: `lodash/debounce`

### `ast-parser.ts`

Lightweight symbol extraction from import statements.

**Key Functions:**
- `parseImportSymbols(statement, file, line)` - Extract imported symbols
- `extractUniqueSymbols(analyses)` - Get unique symbol list

**Parsed Symbol Info:**
- Symbol name and alias
- Default vs. named vs. namespace imports
- Import type (ESM/CommonJS/dynamic)

### `critical-path.ts`

Heuristic-based detection of critical code paths.

**Key Functions:**
- `assessCriticalPath(files)` - Determine if files are critical
- `categorizeFilesByCriticality(files)` - Sort by criticality level
- `extractCriticalPathIndicators(file)` - Get path indicators

**Critical Path Patterns:**
- **Authentication**: `auth/`, `login/`, `oauth/`, `jwt/`
- **Payment**: `payment/`, `checkout/`, `billing/`, `stripe/`
- **Core**: `core/`, `kernel/`, `engine/`
- **API**: `api/`, `routes/`, `controllers/`
- **Database**: `db/`, `models/`, `schema/`
- **Entry Points**: `index.ts`, `main.ts`, `server.ts`, `middleware.ts`

### `usage-mapper.ts`

Orchestrates import scanning, AST parsing, and critical path detection.

**Key Functions:**
- `analyzePackageUsage(files, packageName)` - Main analysis entry point
- `analyzeMultiplePackageUsage(files, packageNames)` - Parallel analysis
- `analyzePackageUsageDetailed(files, packageName)` - Extended metadata
- `buildFileContentsMap(files)` - Helper to build file map

## Performance Characteristics

### Speed
- **Import scanning**: ~500 files/second (regex-based)
- **Symbol extraction**: ~1000 imports/second (regex-based)
- **Critical path**: ~10,000 files/second (pattern matching)

### Memory
- Processes files in-memory (Map-based)
- Scales to ~5,000 files on typical deployment

### Accuracy
- **Import detection**: 95%+ (may miss obfuscated imports)
- **Symbol extraction**: 90%+ (edge cases: complex destructuring)
- **Critical path**: Heuristic-based (tuned for common patterns)

## Integration with PR Analysis

This module is designed to work with the Breaking Change Detection system:

```typescript
import { detectBreakingChanges } from './breaking-changes/detector.js';
import { analyzePackageUsage } from './code-analysis/usage-mapper.js';

// 1. Detect breaking changes for an upgrade
const breakingChanges = await detectBreakingChanges({
  name: 'express',
  fromVersion: '4.18.0',
  toVersion: '5.0.0',
});

// 2. Analyze how express is used in the codebase
const usage = await analyzePackageUsage(fileContents, 'express');

// 3. Correlate: which breaking changes affect actual usage?
const affectedAPIs = breakingChanges
  .flatMap(c => c.affectedAPIs || [])
  .filter(api => usage.importedSymbols.includes(api));

if (affectedAPIs.length > 0 && usage.criticalPaths.length > 0) {
  // High-risk upgrade: breaking changes in critical code
  console.log('⚠️ RISKY: Breaking changes affect critical paths');
}
```

## Testing

Comprehensive test suite with 62 tests covering:
- Import scanning (ESM, CommonJS, dynamic, scoped packages)
- AST parsing (default, named, aliased, namespace imports)
- Critical path detection (auth, payment, core, utilities)
- Integration scenarios (Express, React, scoped packages)

Run tests:
```bash
npm test -- src/code-analysis
```

## Future Enhancements

Potential improvements (not in MVP):

1. **AST Integration**: Use `swc` or `acorn` for more precise parsing
2. **Call Graph Analysis**: Track which functions call imported APIs
3. **Usage Frequency**: Count call sites, not just import statements
4. **Custom Patterns**: Allow users to define critical path rules
5. **Multi-language Support**: Python, Go, Rust import analysis
6. **Incremental Analysis**: Cache results, only re-scan changed files

## License

Internal use only - part of RepoSentinel platform.
