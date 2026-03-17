/**
 * Example Integration: Code Analysis with Breaking Change Detection
 * 
 * This file demonstrates how to use the code-analysis module in conjunction
 * with the breaking-changes module to perform comprehensive dependency impact analysis.
 * 
 * NOTE: This is an example/documentation file, not production code.
 */

import type { BreakingChange, UsageReport, ImpactInsight } from "@mergesignal/shared";
import { detectBreakingChanges, type UpgradeInfo } from "../breaking-changes/detector.js";
import { analyzePackageUsage, buildFileContentsMap } from "./usage-mapper.js";
import { assessCriticalPath } from "./critical-path.js";

/**
 * Example: Analyze the impact of upgrading Express from 4.x to 5.x
 */
export async function exampleExpressUpgrade() {
  // 1. Define the upgrade
  const upgrade: UpgradeInfo = {
    name: 'express',
    fromVersion: '4.18.0',
    toVersion: '5.0.0',
  };
  
  // 2. Detect breaking changes
  const breakingChanges = await detectBreakingChanges(upgrade);
  
  console.log(`Found ${breakingChanges.length} breaking changes in Express 5.x`);
  
  // 3. Load codebase files (in production, this would come from Git)
  const codebaseFiles = buildFileContentsMap([
    {
      path: 'src/server.ts',
      content: `
import express, { Request, Response } from 'express';
const app = express();
app.use(express.json());
app.listen(3000);
      `.trim(),
    },
    {
      path: 'src/auth/middleware.ts',
      content: `
import { Request, Response, NextFunction } from 'express';
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Authentication logic
  next();
};
      `.trim(),
    },
    {
      path: 'src/routes/api.ts',
      content: `
import { Router } from 'express';
const router = Router();
export { router };
      `.trim(),
    },
  ]);
  
  // 4. Analyze how Express is used in the codebase
  const usage = await analyzePackageUsage(codebaseFiles, 'express');
  
  console.log(`Express is used in ${usage.filesUsingPackage.length} files`);
  console.log(`Imported symbols: ${usage.importedSymbols.join(', ')}`);
  console.log(`Critical paths: ${usage.criticalPaths.join(', ')}`);
  
  // 5. Correlate breaking changes with actual usage
  const impact = correlateBreakingChangesWithUsage(breakingChanges, usage);
  
  console.log(`Impact: ${impact.insights.length} insights generated`);
  
  return { breakingChanges, usage, impact };
}

/**
 * Correlate detected breaking changes with actual package usage.
 * This is the core logic that determines "Does this breaking change affect MY code?"
 */
export function correlateBreakingChangesWithUsage(
  breakingChanges: BreakingChange[],
  usage: UsageReport
): { insights: ImpactInsight[]; isCritical: boolean } {
  const insights: ImpactInsight[] = [];
  
  // If the package isn't used, no impact
  if (usage.usageCount === 0) {
    return {
      insights: [{
        type: 'safe_upgrade',
        severity: 'low',
        message: 'Package is not currently used in this codebase',
      }],
      isCritical: false,
    };
  }
  
  // Check each breaking change
  for (const change of breakingChanges) {
    const affectedAPIs = change.affectedAPIs || [];
    
    if (affectedAPIs.length === 0) {
      // Generic breaking change without specific API mention
      insights.push({
        type: 'breaking_change_used',
        severity: change.severity === 'high' ? 'high' : 'medium',
        message: `${change.description} - Package is used in ${usage.filesUsingPackage.length} files`,
        affectedFiles: usage.filesUsingPackage,
      });
    } else {
      // Check if any affected API is imported
      const usedAPIs = affectedAPIs.filter(api => 
        usage.importedSymbols.some(symbol => 
          symbol === api || api.includes(symbol)
        )
      );
      
      if (usedAPIs.length > 0) {
        insights.push({
          type: 'breaking_change_used',
          severity: 'high',
          message: `Breaking change affects ${usedAPIs.join(', ')} used in ${usage.filesUsingPackage.length} files`,
          affectedFiles: usage.filesUsingPackage,
        });
      } else {
        insights.push({
          type: 'breaking_change_unused',
          severity: 'low',
          message: `Breaking change affects ${affectedAPIs.join(', ')} (not used in this codebase)`,
        });
      }
    }
  }
  
  // Assess critical path impact
  const criticalPath = assessCriticalPath(usage.filesUsingPackage);
  
  if (criticalPath.isCritical) {
    insights.push({
      type: 'critical_path_affected',
      severity: 'high',
      message: `Package is used in critical code paths: ${criticalPath.reasons.join(', ')}`,
      affectedFiles: usage.filesUsingPackage,
    });
  }
  
  // Determine if this is a critical/risky upgrade
  const highSeverityCount = insights.filter(i => i.severity === 'high').length;
  const isCritical = highSeverityCount > 0 && criticalPath.isCritical;
  
  return { insights, isCritical };
}

/**
 * Example: Analyze multiple package upgrades in a PR
 */
export async function exampleMultiPackagePRAnalysis(
  upgrades: UpgradeInfo[],
  codebaseFiles: Map<string, string>
) {
  const results = [];
  
  for (const upgrade of upgrades) {
    // Detect breaking changes
    const breakingChanges = await detectBreakingChanges(upgrade);
    
    // Analyze usage
    const usage = await analyzePackageUsage(codebaseFiles, upgrade.name);
    
    // Correlate
    const impact = correlateBreakingChangesWithUsage(breakingChanges, usage);
    
    results.push({
      package: upgrade.name,
      upgrade,
      breakingChanges,
      usage,
      impact,
    });
  }
  
  // Sort by criticality (most risky first)
  results.sort((a, b) => {
    const scoreA = a.impact.isCritical ? 100 : a.impact.insights.length;
    const scoreB = b.impact.isCritical ? 100 : b.impact.insights.length;
    return scoreB - scoreA;
  });
  
  return results;
}

/**
 * Example: Generate GitHub PR comment from analysis
 */
export function generatePRComment(
  packageName: string,
  upgrade: UpgradeInfo,
  breakingChanges: BreakingChange[],
  usage: UsageReport,
  insights: ImpactInsight[]
): string {
  const decision = insights.some(i => i.severity === 'high' && i.type !== 'breaking_change_unused')
    ? '🟡 **Needs Review**'
    : insights.some(i => i.type === 'breaking_change_used')
    ? '🟠 **Caution**'
    : '🟢 **Safe**';
  
  const comment = `
## RepoSentinel: Dependency Impact Analysis

${decision}

### ${packageName}: ${upgrade.fromVersion} → ${upgrade.toVersion}

**Breaking Changes Detected**: ${breakingChanges.length} total

${insights
  .filter(i => i.type !== 'safe_upgrade')
  .map(insight => {
    const icon = insight.severity === 'high' ? '⚠️' : insight.severity === 'medium' ? '⚡' : '✅';
    return `- ${icon} ${insight.message}`;
  })
  .join('\n')}

**Files Using This Package**: ${usage.filesUsingPackage.length}

${usage.criticalPaths.length > 0 
  ? `**Critical Paths**: ⚠️ ${usage.criticalPaths.join(', ')}`
  : ''}

---

**Recommendation**: ${
  insights.some(i => i.severity === 'high')
    ? 'Manual review recommended. Test critical flows before merging.'
    : insights.some(i => i.type === 'breaking_change_used')
    ? 'Review breaking changes. Standard testing should be sufficient.'
    : 'Upgrade appears safe. No breaking changes affect used APIs.'
}
  `.trim();
  
  return comment;
}

/**
 * Example usage - uncomment to run
 */
/*
async function main() {
  const result = await exampleExpressUpgrade();
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
*/
