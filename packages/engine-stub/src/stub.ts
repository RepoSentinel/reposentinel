import type {
  ScanRequest,
  ScanResult,
  UpgradeSimulationRequest,
  UpgradeSimulationResult,
} from "@mergesignal/shared";

/**
 * Stub implementation of the analyze function.
 * The actual analysis engine is proprietary and located in a private repository.
 * This returns mock data for demonstration purposes.
 */
export async function analyze(req: ScanRequest): Promise<ScanResult> {
  console.warn("⚠️  Using stub engine - analysis results are mocked for demonstration only");
  
  return {
    totalScore: 25,
    layerScores: {
      security: 20,
      maintainability: 15,
      ecosystem: 30,
      upgradeImpact: 35,
    },
    findings: [],
    recommendations: [
      {
        id: "stub-rec-1",
        title: "Stub recommendation - actual analysis unavailable",
        rationale: "This is a placeholder result from the stub implementation. Install the proprietary engine for real analysis.",
        impact: "low",
        rank: 1,
        priorityScore: 10,
      },
    ],
    methodologyVersion: "stub-v1",
    confidence: "low",
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Stub implementation of the simulateUpgrade function.
 * The actual upgrade simulation engine is proprietary and located in a private repository.
 * This returns mock data for demonstration purposes.
 */
export async function simulateUpgrade(
  req: UpgradeSimulationRequest
): Promise<UpgradeSimulationResult> {
  console.warn("⚠️  Using stub engine - upgrade simulation results are mocked for demonstration only");
  
  // Return the before state with mock scores
  const mockResult: ScanResult = {
    totalScore: 25,
    layerScores: {
      security: 20,
      maintainability: 15,
      ecosystem: 30,
      upgradeImpact: 35,
    },
    findings: [],
    recommendations: [],
    methodologyVersion: "stub-v1",
    confidence: "low",
    generatedAt: new Date().toISOString(),
  };
  
  return {
    before: mockResult,
    generatedAt: new Date().toISOString(),
  };
}
