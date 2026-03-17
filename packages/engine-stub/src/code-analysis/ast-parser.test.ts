import { describe, it, expect } from 'vitest';
import {
  parseImportSymbols,
  parseMultipleImports,
  extractUniqueSymbols,
} from './ast-parser.js';

describe('ast-parser', () => {
  describe('parseImportSymbols', () => {
    it('should parse default ESM imports', () => {
      const result = parseImportSymbols(
        "import express from 'express'",
        'src/app.ts',
        1
      );

      expect(result).toMatchObject({
        file: 'src/app.ts',
        packageName: 'express',
        importType: 'esm',
        line: 1,
      });
      expect(result?.symbols).toEqual([
        { name: 'express', isDefault: true, isNamespace: false },
      ]);
    });

    it('should parse named ESM imports', () => {
      const result = parseImportSymbols(
        "import { Router, Request } from 'express'",
        'src/app.ts',
        1
      );

      expect(result?.symbols).toEqual([
        { name: 'Router', isDefault: false, isNamespace: false },
        { name: 'Request', isDefault: false, isNamespace: false },
      ]);
    });

    it('should parse aliased imports', () => {
      const result = parseImportSymbols(
        "import { Request as Req, Response as Res } from 'express'",
        'src/app.ts',
        1
      );

      expect(result?.symbols).toEqual([
        { name: 'Request', alias: 'Req', isDefault: false, isNamespace: false },
        { name: 'Response', alias: 'Res', isDefault: false, isNamespace: false },
      ]);
    });

    it('should parse namespace imports', () => {
      const result = parseImportSymbols(
        "import * as express from 'express'",
        'src/app.ts',
        1
      );

      expect(result?.symbols).toEqual([
        { name: 'express', isDefault: false, isNamespace: true },
      ]);
    });

    it('should parse mixed default and named imports', () => {
      const result = parseImportSymbols(
        "import express, { Router } from 'express'",
        'src/app.ts',
        1
      );

      expect(result?.symbols).toEqual([
        { name: 'express', isDefault: true, isNamespace: false },
        { name: 'Router', isDefault: false, isNamespace: false },
      ]);
    });

    it('should parse CommonJS default require', () => {
      const result = parseImportSymbols(
        "const express = require('express')",
        'src/app.js',
        1
      );

      expect(result).toMatchObject({
        packageName: 'express',
        importType: 'commonjs',
      });
      expect(result?.symbols).toEqual([
        { name: 'express', isDefault: true, isNamespace: false },
      ]);
    });

    it('should parse CommonJS destructured require', () => {
      const result = parseImportSymbols(
        "const { Router, Request } = require('express')",
        'src/app.js',
        1
      );

      expect(result?.symbols).toEqual([
        { name: 'Router', isDefault: false, isNamespace: false },
        { name: 'Request', isDefault: false, isNamespace: false },
      ]);
    });

    it('should handle scoped packages', () => {
      const result = parseImportSymbols(
        "import { foo } from '@scope/package'",
        'src/app.ts',
        1
      );

      expect(result?.packageName).toBe('@scope/package');
    });

    it('should handle subpath imports', () => {
      const result = parseImportSymbols(
        "import debounce from 'lodash/debounce'",
        'src/utils.ts',
        1
      );

      expect(result?.packageName).toBe('lodash');
    });

    it('should return null for invalid import statements', () => {
      const result = parseImportSymbols(
        'const foo = "bar"',
        'src/app.ts',
        1
      );

      expect(result).toBeNull();
    });
  });

  describe('parseMultipleImports', () => {
    it('should parse multiple import statements', () => {
      const imports = [
        { statement: "import express from 'express'", file: 'src/app.ts', line: 1 },
        { statement: "import { Router } from 'express'", file: 'src/app.ts', line: 2 },
        { statement: "import react from 'react'", file: 'src/App.tsx', line: 1 },
      ];

      const results = parseMultipleImports(imports);

      expect(results).toHaveLength(3);
      expect(results[0].packageName).toBe('express');
      expect(results[1].packageName).toBe('express');
      expect(results[2].packageName).toBe('react');
    });

    it('should skip invalid imports', () => {
      const imports = [
        { statement: "import express from 'express'", file: 'src/app.ts', line: 1 },
        { statement: 'const foo = "bar"', file: 'src/app.ts', line: 2 },
      ];

      const results = parseMultipleImports(imports);

      expect(results).toHaveLength(1);
      expect(results[0].packageName).toBe('express');
    });
  });

  describe('extractUniqueSymbols', () => {
    it('should extract unique symbol names', () => {
      const analyses = [
        {
          file: 'src/app.ts',
          packageName: 'express',
          symbols: [
            { name: 'Router', isDefault: false, isNamespace: false },
            { name: 'Request', isDefault: false, isNamespace: false },
          ],
          importType: 'esm' as const,
          line: 1,
        },
        {
          file: 'src/routes.ts',
          packageName: 'express',
          symbols: [
            { name: 'Router', isDefault: false, isNamespace: false },
            { name: 'Response', isDefault: false, isNamespace: false },
          ],
          importType: 'esm' as const,
          line: 1,
        },
      ];

      const symbols = extractUniqueSymbols(analyses);

      expect(symbols).toEqual(['Request', 'Response', 'Router']);
    });

    it('should use aliases when present', () => {
      const analyses = [
        {
          file: 'src/app.ts',
          packageName: 'express',
          symbols: [
            { name: 'Request', alias: 'Req', isDefault: false, isNamespace: false },
          ],
          importType: 'esm' as const,
          line: 1,
        },
      ];

      const symbols = extractUniqueSymbols(analyses);

      expect(symbols).toEqual(['Req']);
    });

    it('should handle empty input', () => {
      const symbols = extractUniqueSymbols([]);
      expect(symbols).toEqual([]);
    });
  });
});
