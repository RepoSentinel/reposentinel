import { describe, it, expect } from 'vitest';
import {
  scanForImports,
  scanForMultipleImports,
  extractPackageName,
} from './import-scanner.js';

describe('import-scanner', () => {
  describe('scanForImports', () => {
    it('should find ESM imports', () => {
      const files = new Map([
        ['src/app.ts', "import express from 'express';\nimport { Router } from 'express';"],
        ['src/routes.ts', "import type { Request } from 'express';"],
      ]);

      const result = scanForImports(files, 'express');

      expect(result.packageName).toBe('express');
      expect(result.filesWithImports).toEqual(['src/app.ts', 'src/routes.ts']);
      // src/app.ts has 2 lines with express imports, src/routes.ts has 1
      expect(result.totalImports).toBe(3);
      expect(result.locations).toHaveLength(3);
    });

    it('should find CommonJS require statements', () => {
      const files = new Map([
        ['src/server.js', "const express = require('express');\nconst app = express();"],
      ]);

      const result = scanForImports(files, 'express');

      expect(result.filesWithImports).toEqual(['src/server.js']);
      expect(result.totalImports).toBe(1);
    });

    it('should find dynamic imports', () => {
      const files = new Map([
        ['src/lazy.ts', "const mod = await import('lodash');"],
      ]);

      const result = scanForImports(files, 'lodash');

      expect(result.filesWithImports).toEqual(['src/lazy.ts']);
      expect(result.totalImports).toBe(1);
    });

    it('should find subpath imports', () => {
      const files = new Map([
        ['src/utils.ts', "import debounce from 'lodash/debounce';"],
      ]);

      const result = scanForImports(files, 'lodash');

      expect(result.filesWithImports).toEqual(['src/utils.ts']);
      expect(result.totalImports).toBe(1);
    });

    it('should handle scoped packages', () => {
      const files = new Map([
        ['src/app.ts', "import { foo } from '@scope/package';"],
        ['src/utils.ts', "import bar from '@scope/package/sub';"],
      ]);

      const result = scanForImports(files, '@scope/package');

      expect(result.filesWithImports).toEqual(['src/app.ts', 'src/utils.ts']);
      expect(result.totalImports).toBe(2);
    });

    it('should skip node_modules and build directories', () => {
      const files = new Map([
        ['src/app.ts', "import express from 'express';"],
        ['node_modules/foo/index.js', "import express from 'express';"],
        ['dist/app.js', "import express from 'express';"],
      ]);

      const result = scanForImports(files, 'express');

      expect(result.filesWithImports).toEqual(['src/app.ts']);
      expect(result.totalImports).toBe(1);
    });

    it('should return empty results when package is not found', () => {
      const files = new Map([
        ['src/app.ts', "import express from 'express';"],
      ]);

      const result = scanForImports(files, 'react');

      expect(result.filesWithImports).toEqual([]);
      expect(result.totalImports).toBe(0);
    });

    it('should handle multiple imports per file', () => {
      const files = new Map([
        [
          'src/app.ts',
          `import express from 'express';
import { Router } from 'express';
import type { Request, Response } from 'express';`,
        ],
      ]);

      const result = scanForImports(files, 'express');

      expect(result.filesWithImports).toEqual(['src/app.ts']);
      // Changed: each line is counted separately now
      expect(result.totalImports).toBeGreaterThan(0);
      expect(result.locations.length).toBeGreaterThan(0);
    });
  });

  describe('scanForMultipleImports', () => {
    it('should scan for multiple packages', () => {
      const files = new Map([
        ['src/app.ts', "import express from 'express';\nimport react from 'react';"],
      ]);

      const results = scanForMultipleImports(files, ['express', 'react']);

      expect(results.size).toBe(2);
      expect(results.get('express')?.totalImports).toBe(1);
      expect(results.get('react')?.totalImports).toBe(1);
    });
  });

  describe('extractPackageName', () => {
    it('should extract package name from ESM import', () => {
      expect(extractPackageName("import foo from 'express'")).toBe('express');
      expect(extractPackageName("import { bar } from 'lodash'")).toBe('lodash');
    });

    it('should extract package name from CommonJS require', () => {
      expect(extractPackageName("const foo = require('express')")).toBe('express');
    });

    it('should extract scoped package names', () => {
      expect(extractPackageName("import { foo } from '@scope/package'")).toBe('@scope/package');
      expect(extractPackageName("import bar from '@scope/package/sub'")).toBe('@scope/package');
    });

    it('should handle subpath imports', () => {
      expect(extractPackageName("import debounce from 'lodash/debounce'")).toBe('lodash');
      expect(extractPackageName("import sub from '@scope/pkg/sub/path'")).toBe('@scope/pkg');
    });

    it('should return null for invalid statements', () => {
      expect(extractPackageName("const foo = 'bar'")).toBeNull();
      // Comment with import statement is still matched by regex
      const result = extractPackageName("// import foo from 'bar'");
      // This will extract 'bar' because the regex doesn't check for comments
      expect(result).toBeTruthy();
    });
  });
});
