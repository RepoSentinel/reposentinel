import { describe, it, expect } from 'vitest';
import {
  assessCriticalPath,
  categorizeFilesByCriticality,
  extractCriticalPathIndicators,
} from './critical-path.js';

describe('critical-path', () => {
  describe('assessCriticalPath', () => {
    it('should detect authentication as critical', () => {
      const files = ['src/auth/login.ts', 'src/auth/jwt.ts'];
      const result = assessCriticalPath(files);

      expect(result.isCritical).toBe(true);
      expect(result.score).toBeGreaterThan(40);
      expect(result.reasons.some(r => r.includes('auth'))).toBe(true);
    });

    it('should detect payment processing as critical', () => {
      const files = ['src/payment/checkout.ts', 'src/payment/stripe.ts'];
      const result = assessCriticalPath(files);

      expect(result.isCritical).toBe(true);
      expect(result.score).toBeGreaterThan(40);
      expect(result.reasons.some(r => r.includes('payment'))).toBe(true);
    });

    it('should detect core infrastructure as critical', () => {
      const files = ['src/core/engine.ts'];
      const result = assessCriticalPath(files);

      expect(result.isCritical).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(30);
    });

    it('should detect main entry points as critical', () => {
      const files = ['src/index.ts', 'src/server.ts'];
      const result = assessCriticalPath(files);

      expect(result.isCritical).toBe(true);
      expect(result.score).toBeGreaterThan(40);
    });

    it('should detect middleware as critical', () => {
      const files = ['src/middleware.ts'];
      const result = assessCriticalPath(files);

      expect(result.isCritical).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(30);
    });

    it('should not mark utility files as critical', () => {
      const files = ['src/utils/helpers.ts', 'src/utils/format.ts'];
      const result = assessCriticalPath(files);

      expect(result.isCritical).toBe(false);
      expect(result.score).toBeLessThan(40);
    });

    it('should not mark component files as critical', () => {
      const files = ['src/components/Button.tsx', 'src/components/Card.tsx'];
      const result = assessCriticalPath(files);

      expect(result.isCritical).toBe(false);
    });

    it('should handle empty file list', () => {
      const result = assessCriticalPath([]);

      expect(result.isCritical).toBe(false);
      expect(result.score).toBe(0);
      expect(result.reasons).toEqual([]);
    });

    it('should cap score at 100', () => {
      const files = [
        'src/auth/login.ts',
        'src/payment/checkout.ts',
        'src/core/index.ts',
        'src/middleware.ts',
        'src/api/routes.ts',
        'src/db/models.ts',
      ];
      const result = assessCriticalPath(files);

      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should prioritize auth/payment reasons', () => {
      const files = [
        'src/auth/login.ts',
        'src/utils/helpers.ts',
        'src/payment/checkout.ts',
      ];
      const result = assessCriticalPath(files);

      expect(result.reasons[0]).toMatch(/(auth|payment)/i);
    });

    it('should limit reasons to top 5', () => {
      const files = [
        'src/auth/login.ts',
        'src/payment/checkout.ts',
        'src/core/index.ts',
        'src/api/routes.ts',
        'src/db/models.ts',
        'src/user/profile.ts',
        'src/service/worker.ts',
      ];
      const result = assessCriticalPath(files);

      expect(result.reasons.length).toBeLessThanOrEqual(5);
    });
  });

  describe('categorizeFilesByCriticality', () => {
    it('should categorize files by criticality level', () => {
      const files = [
        'src/auth/login.ts',          // critical (>40)
        'src/api/routes.ts',           // important (20-40)
        'src/components/Button.tsx',   // normal (<20)
      ];

      const result = categorizeFilesByCriticality(files);

      expect(result.critical).toContain('src/auth/login.ts');
      expect(result.important).toContain('src/api/routes.ts');
      expect(result.normal).toContain('src/components/Button.tsx');
    });

    it('should handle empty input', () => {
      const result = categorizeFilesByCriticality([]);

      expect(result.critical).toEqual([]);
      expect(result.important).toEqual([]);
      expect(result.normal).toEqual([]);
    });
  });

  describe('extractCriticalPathIndicators', () => {
    it('should extract indicators from auth files', () => {
      const indicators = extractCriticalPathIndicators('src/auth/login.ts');

      expect(indicators).toContain('authentication');
    });

    it('should extract indicators from payment files', () => {
      const indicators = extractCriticalPathIndicators('src/payment/checkout.ts');

      expect(indicators).toContain('payment processing');
    });

    it('should extract indicators from main entry points', () => {
      const indicators = extractCriticalPathIndicators('src/index.ts');

      expect(indicators).toContain('main entry point');
    });

    it('should extract multiple indicators', () => {
      const indicators = extractCriticalPathIndicators('src/auth/middleware.ts');

      expect(indicators.length).toBeGreaterThan(1);
      expect(indicators).toContain('authentication');
      expect(indicators).toContain('middleware');
    });

    it('should return empty array for non-critical files', () => {
      const indicators = extractCriticalPathIndicators('src/components/Button.tsx');

      expect(indicators).toEqual([]);
    });

    it('should deduplicate indicators', () => {
      const indicators = extractCriticalPathIndicators('src/auth/login.ts');

      expect(indicators.length).toBe(new Set(indicators).size);
    });
  });
});
