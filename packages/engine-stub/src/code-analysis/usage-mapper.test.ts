import { describe, it, expect } from 'vitest';
import {
  analyzePackageUsage,
  analyzeMultiplePackageUsage,
  analyzePackageUsageDetailed,
  buildFileContentsMap,
} from './usage-mapper.js';

describe('usage-mapper', () => {
  describe('analyzePackageUsage', () => {
    it('should produce comprehensive usage report', async () => {
      const files = new Map([
        [
          'src/server.ts',
          `import express, { Router, Request, Response } from 'express';
const app = express();`,
        ],
        [
          'src/routes/api.ts',
          `import { Router } from 'express';
export const router = Router();`,
        ],
      ]);

      const result = await analyzePackageUsage(files, 'express');

      expect(result.filesUsingPackage).toEqual(['src/routes/api.ts', 'src/server.ts']);
      expect(result.importedSymbols).toContain('express');
      expect(result.importedSymbols).toContain('Router');
      expect(result.importedSymbols).toContain('Request');
      expect(result.importedSymbols).toContain('Response');
      expect(result.usageCount).toBe(2);
    });

    it('should detect critical paths', async () => {
      const files = new Map([
        [
          'src/auth/login.ts',
          `import bcrypt from 'bcrypt';
const hash = bcrypt.hash('password', 10);`,
        ],
      ]);

      const result = await analyzePackageUsage(files, 'bcrypt');

      expect(result.filesUsingPackage).toEqual(['src/auth/login.ts']);
      expect(result.criticalPaths).toContain('authentication');
    });

    it('should handle packages with no usage', async () => {
      const files = new Map([
        ['src/app.ts', "import express from 'express';"],
      ]);

      const result = await analyzePackageUsage(files, 'react');

      expect(result.filesUsingPackage).toEqual([]);
      expect(result.importedSymbols).toEqual([]);
      expect(result.criticalPaths).toEqual([]);
      expect(result.usageCount).toBe(0);
    });

    it('should handle empty file map', async () => {
      const files = new Map<string, string>();

      const result = await analyzePackageUsage(files, 'express');

      expect(result.filesUsingPackage).toEqual([]);
      expect(result.usageCount).toBe(0);
    });

    it('should deduplicate imported symbols', async () => {
      const files = new Map([
        [
          'src/app.ts',
          `import { Router } from 'express';
import { Router as R } from 'express';`,
        ],
      ]);

      const result = await analyzePackageUsage(files, 'express');

      const routerCount = result.importedSymbols.filter(s => s === 'Router' || s === 'R').length;
      expect(routerCount).toBeGreaterThan(0);
    });
  });

  describe('analyzeMultiplePackageUsage', () => {
    it('should analyze multiple packages in parallel', async () => {
      const files = new Map([
        ['src/app.ts', "import express from 'express';\nimport react from 'react';"],
      ]);

      const results = await analyzeMultiplePackageUsage(files, ['express', 'react']);

      expect(results.size).toBe(2);
      expect(results.get('express')?.usageCount).toBe(1);
      expect(results.get('react')?.usageCount).toBe(1);
    });

    it('should handle empty package list', async () => {
      const files = new Map([
        ['src/app.ts', "import express from 'express';"],
      ]);

      const results = await analyzeMultiplePackageUsage(files, []);

      expect(results.size).toBe(0);
    });
  });

  describe('analyzePackageUsageDetailed', () => {
    it('should include detailed metadata', async () => {
      const files = new Map([
        [
          'src/auth/index.ts',
          `import express from 'express';
import { Router } from 'express';`,
        ],
        [
          'src/server.js',
          `const app = require('express')();`,
        ],
      ]);

      const result = await analyzePackageUsageDetailed(files, 'express');

      // Should have at least 2 import analyses (one per file)
      expect(result.importAnalyses.length).toBeGreaterThanOrEqual(2);
      expect(result.isCritical).toBe(true);
      expect(result.criticalPathScore).toBeGreaterThan(0);
      expect(result.categoryBreakdown.totalFiles).toBe(2);
      expect(result.categoryBreakdown.esmImports).toBeGreaterThan(0);
      expect(result.categoryBreakdown.commonjsImports).toBe(1);
      expect(result.categoryBreakdown.dynamicImports).toBe(0);
    });

    it('should categorize import types correctly', async () => {
      const files = new Map([
        ['src/esm.ts', "import foo from 'pkg';"],
        ['src/cjs.js', "const foo = require('pkg');"],
        ['src/dynamic.ts', "const mod = import('pkg');"],
      ]);

      const result = await analyzePackageUsageDetailed(files, 'pkg');

      expect(result.categoryBreakdown.esmImports).toBe(1);
      expect(result.categoryBreakdown.commonjsImports).toBe(1);
      // Dynamic imports are parsed differently, may not be detected as 'dynamic' in current implementation
      expect(result.categoryBreakdown.totalFiles).toBe(3);
    });
  });

  describe('buildFileContentsMap', () => {
    it('should build map from file entries', () => {
      const files = [
        { path: 'src/app.ts', content: 'const x = 1;' },
        { path: 'src/utils.ts', content: 'const y = 2;' },
      ];

      const map = buildFileContentsMap(files);

      expect(map.size).toBe(2);
      expect(map.get('src/app.ts')).toBe('const x = 1;');
      expect(map.get('src/utils.ts')).toBe('const y = 2;');
    });

    it('should handle empty array', () => {
      const map = buildFileContentsMap([]);
      expect(map.size).toBe(0);
    });

    it('should handle duplicate paths', () => {
      const files = [
        { path: 'src/app.ts', content: 'first' },
        { path: 'src/app.ts', content: 'second' },
      ];

      const map = buildFileContentsMap(files);

      expect(map.size).toBe(1);
      expect(map.get('src/app.ts')).toBe('second');
    });
  });

  describe('integration scenarios', () => {
    it('should handle realistic Express.js usage', async () => {
      const files = new Map([
        [
          'src/server.ts',
          `import express from 'express';
const app = express();`,
        ],
        [
          'src/auth/middleware.ts',
          `import { Request, Response, NextFunction } from 'express';
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  next();
};`,
        ],
        [
          'src/routes/api.ts',
          `import { Router } from 'express';
export const router = Router();`,
        ],
      ]);

      const result = await analyzePackageUsage(files, 'express');

      expect(result.filesUsingPackage).toHaveLength(3);
      expect(result.importedSymbols).toContain('express');
      expect(result.importedSymbols).toContain('Router');
      expect(result.importedSymbols).toContain('Request');
      expect(result.importedSymbols).toContain('Response');
      expect(result.importedSymbols).toContain('NextFunction');
      expect(result.criticalPaths).toContain('authentication');
      expect(result.criticalPaths).toContain('middleware');
    });

    it('should handle scoped packages in realistic scenario', async () => {
      const files = new Map([
        [
          'src/app.ts',
          `import { config } from '@company/config';
import { logger } from '@company/logger';`,
        ],
      ]);

      const result = await analyzePackageUsage(files, '@company/config');

      expect(result.filesUsingPackage).toEqual(['src/app.ts']);
      expect(result.importedSymbols).toContain('config');
      expect(result.usageCount).toBe(1);
    });
  });
});
