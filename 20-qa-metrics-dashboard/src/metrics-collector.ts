/**
 * QA Metrics Collector
 * Coleta e agrega métricas de qualidade de múltiplas fontes
 */

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'broken';
  duration: number;
  timestamp: Date;
  suite: string;
  browser?: string;
  retries?: number;
}

interface TestMetrics {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  broken: number;
  passRate: number;
  avgDuration: number;
  totalDuration: number;
  flakyTests: string[];
  slowestTests: TestResult[];
}

interface CoverageMetrics {
  lines: number;
  branches: number;
  functions: number;
  statements: number;
  trend: 'up' | 'down' | 'stable';
  delta: number;
}

interface QualityScore {
  overall: number;
  testStability: number;
  codeCoverage: number;
  defectDensity: number;
  mttr: number; // Mean Time To Resolution
}

export class MetricsCollector {
  private testResults: TestResult[] = [];
  private historicalResults: Map<string, TestResult[]> = new Map();

  addResult(result: TestResult): void {
    this.testResults.push(result);
    
    // Track historical results for flaky detection
    const history = this.historicalResults.get(result.name) || [];
    history.push(result);
    this.historicalResults.set(result.name, history.slice(-10)); // Keep last 10
  }

  calculateMetrics(): TestMetrics {
    const passed = this.testResults.filter(t => t.status === 'passed').length;
    const failed = this.testResults.filter(t => t.status === 'failed').length;
    const skipped = this.testResults.filter(t => t.status === 'skipped').length;
    const broken = this.testResults.filter(t => t.status === 'broken').length;
    const totalTests = this.testResults.length;

    const durations = this.testResults.map(t => t.duration);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const avgDuration = totalDuration / totalTests || 0;

    // Detect flaky tests (inconsistent results in history)
    const flakyTests = this.detectFlakyTests();

    // Find slowest tests
    const slowestTests = [...this.testResults]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      totalTests,
      passed,
      failed,
      skipped,
      broken,
      passRate: (passed / (totalTests - skipped)) * 100 || 0,
      avgDuration,
      totalDuration,
      flakyTests,
      slowestTests
    };
  }

  private detectFlakyTests(): string[] {
    const flaky: string[] = [];

    this.historicalResults.forEach((results, testName) => {
      if (results.length < 3) return;

      const statuses = results.map(r => r.status);
      const hasInconsistentResults = 
        statuses.includes('passed') && 
        (statuses.includes('failed') || statuses.includes('broken'));

      if (hasInconsistentResults) {
        flaky.push(testName);
      }
    });

    return flaky;
  }

  calculateQualityScore(metrics: TestMetrics, coverage: CoverageMetrics): QualityScore {
    // Test stability score (0-100)
    const testStability = metrics.passRate - (metrics.flakyTests.length * 2);

    // Coverage score (weighted average)
    const codeCoverage = (
      coverage.lines * 0.3 +
      coverage.branches * 0.3 +
      coverage.functions * 0.2 +
      coverage.statements * 0.2
    );

    // Defect density (lower is better, inverted for score)
    const defectRate = (metrics.failed + metrics.broken) / metrics.totalTests;
    const defectDensity = Math.max(0, 100 - (defectRate * 500));

    // MTTR placeholder (would come from issue tracker)
    const mttr = 85; // Example score

    // Overall score
    const overall = (
      testStability * 0.3 +
      codeCoverage * 0.3 +
      defectDensity * 0.2 +
      mttr * 0.2
    );

    return {
      overall: Math.round(overall),
      testStability: Math.round(testStability),
      codeCoverage: Math.round(codeCoverage),
      defectDensity: Math.round(defectDensity),
      mttr
    };
  }

  generateReport(metrics: TestMetrics, score: QualityScore): string {
    const statusEmoji = (rate: number) => 
      rate >= 95 ? '🟢' : rate >= 80 ? '🟡' : '🔴';

    return `
════════════════════════════════════════════════
📊 QA METRICS DASHBOARD
════════════════════════════════════════════════

🧪 TEST RESULTS
────────────────────────
  Total Tests:    ${metrics.totalTests}
  ✅ Passed:       ${metrics.passed}
  ❌ Failed:       ${metrics.failed}
  ⏭️  Skipped:      ${metrics.skipped}
  ⚠️  Broken:       ${metrics.broken}

  ${statusEmoji(metrics.passRate)} Pass Rate:    ${metrics.passRate.toFixed(2)}%
  ⏱️  Avg Duration: ${(metrics.avgDuration / 1000).toFixed(2)}s
  ⏳ Total Time:   ${(metrics.totalDuration / 60000).toFixed(2)}min

🎯 QUALITY SCORE
────────────────────────
  🏆 Overall:        ${score.overall}/100
  📊 Test Stability: ${score.testStability}/100
  📈 Code Coverage:  ${score.codeCoverage}/100
  🐛 Defect Density: ${score.defectDensity}/100
  ⏱️  MTTR Score:     ${score.mttr}/100

⚠️  FLAKY TESTS (${metrics.flakyTests.length})
────────────────────────
${metrics.flakyTests.map(t => `  • ${t}`).join('\n') || '  None detected'}

🐢 SLOWEST TESTS
────────────────────────
${metrics.slowestTests.slice(0, 5).map(t => 
  `  • ${t.name} (${(t.duration / 1000).toFixed(2)}s)`
).join('\n')}

════════════════════════════════════════════════
    `.trim();
  }

  exportToJSON(): object {
    const metrics = this.calculateMetrics();
    const coverage: CoverageMetrics = {
      lines: 85,
      branches: 78,
      functions: 90,
      statements: 87,
      trend: 'up',
      delta: 2.5
    };
    const score = this.calculateQualityScore(metrics, coverage);

    return {
      timestamp: new Date().toISOString(),
      metrics,
      coverage,
      score,
      testResults: this.testResults
    };
  }

  reset(): void {
    this.testResults = [];
  }
}

// Allure Integration
export async function syncWithAllure(projectId: string): Promise<void> {
  console.log(`🔄 Syncing with Allure for project: ${projectId}`);
  // Implementation for Allure TestOps API integration
}

// ReportPortal Integration
export async function syncWithReportPortal(projectName: string): Promise<void> {
  console.log(`🔄 Syncing with ReportPortal for project: ${projectName}`);
  // Implementation for ReportPortal API integration
}

// TestRail Integration
export async function syncWithTestRail(projectId: number): Promise<void> {
  console.log(`🔄 Syncing with TestRail for project: ${projectId}`);
  // Implementation for TestRail API integration
}
