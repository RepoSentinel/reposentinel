# Code Analysis Performance

This module provides code analysis capabilities with performance safeguards for large repositories.

## Features

### 1. Performance Benchmarking

The test suite includes benchmarks for analyzing repositories of different sizes:

- Small repos (10 files)
- Medium repos (100 files)
- Large repos (1000+ files)

Run benchmarks:

```bash
pnpm test codeAnalysisService.test.ts
```

### 2. Timeout Protection

Code analysis operations have a configurable timeout to prevent long-running operations:

- **Default timeout**: 30 seconds
- **Configuration**: Set `CODE_ANALYSIS_TIMEOUT_MS` environment variable

When a timeout occurs:

- Analysis gracefully degrades
- Returns empty analysis result
- Sets `timedOut: true` flag
- Scan continues with dependency analysis only

### 3. Caching by Commit SHA

Analysis results are cached per commit SHA to avoid redundant work:

- **Cache key**: `repoId:sha:filesHash`
- **Default TTL**: 24 hours
- **Configuration**: Set `CODE_ANALYSIS_CACHE_TTL_MS` environment variable
- **Storage**: Redis (distributed cache)

Cache benefits:

- Instant results for re-analyzed commits
- Reduced load on code analysis infrastructure
- Better performance for CI/CD workflows

### 4. Graceful Degradation

When analysis fails or times out:

- Scan continues without code analysis insights
- Dependency analysis still runs
- Risk scores are computed from available data
- No user-facing errors

## Configuration

Environment variables:

```bash
# Analysis timeout (milliseconds)
CODE_ANALYSIS_TIMEOUT_MS=30000

# Cache TTL (milliseconds)
CODE_ANALYSIS_CACHE_TTL_MS=86400000
```

## Usage

```typescript
import { analyzeSourceFiles } from "./codeAnalysisService.js";
import { CodeAnalysisCache } from "./codeAnalysisCache.js";

const cache = new CodeAnalysisCache(redisClient, cacheTtlMs);

const result = await analyzeSourceFiles(repoSource, changedFiles, {
  timeoutMs: 30000,
  cache,
});

if (result?.timedOut) {
  console.log("Analysis timed out, continuing with partial data");
}

if (result?.fromCache) {
  console.log("Cache hit! Analysis completed instantly");
}
```

## Metrics

Code analysis metrics are included in scan results:

```typescript
{
  codeAnalysisMetrics: {
    fromCache: boolean,
    analysisTimeMs: number,
    timedOut: boolean,
    filesAnalyzed: number
  }
}
```

## Performance Guidelines

For optimal performance:

1. **Set appropriate timeouts** based on your repository size
2. **Enable caching** for CI/CD workflows
3. **Monitor timeout rates** to identify analysis bottlenecks
4. **Consider timeout increase** if >5% of scans timeout

## Future Improvements

Potential enhancements:

- AST-based import scanning (more accurate than regex)
- Incremental analysis (only changed files)
- Parallel file processing
- Worker pool for CPU-intensive parsing
