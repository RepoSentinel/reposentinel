/**
 * Critical Path Detection - Heuristic-based critical code detection
 * 
 * Uses folder names and file patterns to identify critical parts of the codebase.
 * No ML needed - simple heuristics work well in practice.
 */

import type { CriticalPathScore } from "@mergesignal/shared";

/**
 * Folders that typically contain critical business logic.
 * Higher scores indicate more critical paths.
 */
const CRITICAL_FOLDERS: Array<{ pattern: RegExp; weight: number; description: string }> = [
  // Authentication & Security (highest priority)
  { pattern: /\/(auth|authentication|login|signup|signin)\//, weight: 35, description: "authentication" },
  { pattern: /\/(security|oauth|jwt|session)\//, weight: 30, description: "security" },
  
  // Payment & Billing (highest priority)
  { pattern: /\/(payment|payments|checkout|billing|stripe|paypal)\//, weight: 35, description: "payment processing" },
  
  // Core infrastructure
  { pattern: /\/(core|kernel|engine|foundation)\//, weight: 30, description: "core infrastructure" },
  
  // API & Routes
  { pattern: /\/(api|routes|controllers|endpoints)\//, weight: 25, description: "API layer" },
  
  // Database & Data
  { pattern: /\/(db|database|models|schema|migrations)\//, weight: 25, description: "database layer" },
  
  // User management
  { pattern: /\/(user|users|account|accounts|profile)\//, weight: 20, description: "user management" },
  
  // Critical services
  { pattern: /\/(service|services|worker|workers|queue)\//, weight: 20, description: "service layer" },
  
  // Configuration
  { pattern: /\/(config|configuration|settings)\//, weight: 15, description: "configuration" },
];

/**
 * Files that are typically critical entry points.
 */
const CRITICAL_FILES: Array<{ pattern: RegExp; weight: number; description: string }> = [
  // Main entry points
  { pattern: /\/(index|main|app|server)\.(ts|tsx|js|jsx|mjs|cjs)$/, weight: 25, description: "main entry point" },
  
  // Root configuration
  { pattern: /\/next\.config\.(js|ts|mjs)$/, weight: 20, description: "Next.js config" },
  { pattern: /\/vite\.config\.(js|ts|mjs)$/, weight: 20, description: "Vite config" },
  { pattern: /\/astro\.config\.(js|ts|mjs)$/, weight: 20, description: "Astro config" },
  
  // Middleware (critical for request processing)
  { pattern: /\/middleware\.(ts|tsx|js|jsx)$/, weight: 30, description: "middleware" },
  
  // Environment and secrets
  { pattern: /\/\.env/, weight: 35, description: "environment configuration" },
];

/**
 * File patterns that indicate high usage frequency but NOT critical.
 * These have lower weights and don't trigger critical threshold alone.
 */
const HIGH_FREQUENCY_PATTERNS: Array<{ pattern: RegExp; weight: number }> = [
  // Utilities used everywhere (not critical by themselves)
  { pattern: /\/(utils|helpers|lib)\//, weight: 5 },
  
  // Shared components (not critical by themselves)
  { pattern: /\/(shared|components)\//, weight: 5 },
];

/**
 * Assess if files are in critical code paths using heuristics.
 * 
 * @param files - List of file paths to assess
 * @returns Critical path score and reasoning
 */
export function assessCriticalPath(files: string[]): CriticalPathScore {
  let score = 0;
  const reasons: string[] = [];
  const criticalFiles = new Set<string>();
  
  for (const file of files) {
    let fileScore = 0;
    const fileReasons: string[] = [];
    
    // Check against critical folders
    for (const { pattern, weight, description } of CRITICAL_FOLDERS) {
      if (pattern.test(file)) {
        fileScore += weight;
        fileReasons.push(`${description}: ${file}`);
        criticalFiles.add(file);
      }
    }
    
    // Check against critical files
    for (const { pattern, weight, description } of CRITICAL_FILES) {
      if (pattern.test(file)) {
        fileScore += weight;
        fileReasons.push(`${description}: ${file}`);
        criticalFiles.add(file);
      }
    }
    
    // Check against high-frequency patterns
    for (const { pattern, weight } of HIGH_FREQUENCY_PATTERNS) {
      if (pattern.test(file)) {
        fileScore += weight;
      }
    }
    
    score += fileScore;
    reasons.push(...fileReasons);
  }
  
  // Normalize score and determine if critical
  // Threshold: Score >= 30 indicates critical path (lowered from 40 to match single-file cases)
  const isCritical = score >= 30 || criticalFiles.size > 0;
  
  // Deduplicate and prioritize reasons
  const uniqueReasons = Array.from(new Set(reasons))
    .sort((a, b) => {
      // Prioritize auth/payment > core > api > other
      const priority = (r: string) => {
        if (r.includes('auth') || r.includes('payment')) return 0;
        if (r.includes('security')) return 1;
        if (r.includes('core')) return 2;
        if (r.includes('api') || r.includes('middleware')) return 3;
        return 4;
      };
      return priority(a) - priority(b);
    })
    .slice(0, 5); // Limit to top 5 reasons
  
  return {
    isCritical,
    score: Math.min(100, Math.round(score)), // Cap at 100
    reasons: uniqueReasons,
  };
}

/**
 * Categorize files by their criticality level.
 */
export function categorizeFilesByCriticality(
  files: string[]
): {
  critical: string[];
  important: string[];
  normal: string[];
} {
  const critical: string[] = [];
  const important: string[] = [];
  const normal: string[] = [];
  
  for (const file of files) {
    const score = assessCriticalPath([file]).score;
    
    if (score >= 30) {
      critical.push(file);
    } else if (score > 20) {
      important.push(file);
    } else {
      normal.push(file);
    }
  }
  
  return { critical, important, normal };
}

/**
 * Extract critical path indicators from file path.
 * Returns array of matched indicators.
 */
export function extractCriticalPathIndicators(file: string): string[] {
  const indicators: string[] = [];
  
  for (const { pattern, description } of CRITICAL_FOLDERS) {
    if (pattern.test(file)) {
      indicators.push(description);
    }
  }
  
  for (const { pattern, description } of CRITICAL_FILES) {
    if (pattern.test(file)) {
      indicators.push(description);
    }
  }
  
  return Array.from(new Set(indicators));
}
