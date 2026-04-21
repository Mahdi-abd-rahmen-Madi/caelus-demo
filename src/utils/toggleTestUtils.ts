import maplibregl from 'maplibre-gl';
import { LayerValidator } from './layerValidation';
import { LayerDebugger } from './layerDebugging';

export interface TestScenario {
  name: string;
  description: string;
  setup: () => Record<string, boolean>;
  expectedResults: {
    visibleLayers: string[];
    hiddenLayers: string[];
  };
}

/**
 * Test utilities for validating toggle behavior
 */
export class ToggleTester {
  private static debugMode = false;

  static enableDebugMode() {
    this.debugMode = true;
    LayerDebugger.enable();
  }

  static disableDebugMode() {
    this.debugMode = false;
    LayerDebugger.disable();
  }

  /**
   * Run comprehensive toggle consistency tests
   */
  static runToggleTests(map: maplibregl.Map | null): {
    passed: number;
    failed: number;
    errors: string[];
    details: any[];
  } {
    if (!map) {
      return {
        passed: 0,
        failed: 0,
        errors: ['Map is null'],
        details: []
      };
    }

    const testScenarios: TestScenario[] = [
      {
        name: 'Basic Toggle Test',
        description: 'Test basic on/off functionality',
        setup: () => ({
          'dynamic-mvt-simple': true,
          'railway-network': false,
          'enedis-v2': true
        }),
        expectedResults: {
          visibleLayers: ['dynamic-mvt-simple-fill', 'dynamic-mvt-simple-outline'],
          hiddenLayers: ['railway-network']
        }
      },
      {
        name: 'All Layers Visible',
        description: 'Test all layers turned on',
        setup: () => ({
          'dynamic-mvt-simple': true,
          'railway-network': true,
          'enedis-v2': true,
          'plu-network': true
        }),
        expectedResults: {
          visibleLayers: ['dynamic-mvt-simple-fill', 'dynamic-mvt-simple-outline', 'railway-network'],
          hiddenLayers: []
        }
      },
      {
        name: 'All Layers Hidden',
        description: 'Test all layers turned off',
        setup: () => ({
          'dynamic-mvt-simple': false,
          'railway-network': false,
          'enedis-v2': false,
          'plu-network': false
        }),
        expectedResults: {
          visibleLayers: [],
          hiddenLayers: ['dynamic-mvt-simple-fill', 'dynamic-mvt-simple-outline', 'railway-network']
        }
      }
    ];

    const results = {
      passed: 0,
      failed: 0,
      errors: [] as string[],
      details: [] as any[]
    };

    testScenarios.forEach(scenario => {
      try {
        if (this.debugMode) {
          console.log(`[ToggleTester] Running scenario: ${scenario.name}`);
        }

        // Setup toggle states
        const toggleStates = scenario.setup();

        // Validate toggle consistency
        const validationResults = LayerValidator.validateAllToggles(map, toggleStates);
        const summary = LayerValidator.getValidationSummary(validationResults);

        // Check expected visibility
        const actualVisibleLayers: string[] = [];
        const actualHiddenLayers: string[] = [];

        validationResults.forEach(result => {
          if (result.actualVisibility) {
            actualVisibleLayers.push(result.layerId);
          } else {
            actualHiddenLayers.push(result.layerId);
          }
        });

        // Validate expectations
        const expectedVisible = scenario.expectedResults.visibleLayers;
        const expectedHidden = scenario.expectedResults.hiddenLayers;

        const visibleMatch = this.arraysEqual(
          actualVisibleLayers.sort(),
          expectedVisible.sort()
        );
        const hiddenMatch = this.arraysEqual(
          actualHiddenLayers.sort(),
          expectedHidden.sort()
        );

        const scenarioPassed = visibleMatch && hiddenMatch && summary.inconsistent === 0;

        if (scenarioPassed) {
          results.passed++;
        } else {
          results.failed++;
          results.errors.push(`${scenario.name}: Validation failed`);
        }

        results.details.push({
          scenario: scenario.name,
          passed: scenarioPassed,
          toggleStates,
          validationResults,
          summary,
          expectedVisible,
          actualVisibleLayers,
          expectedHidden,
          actualHiddenLayers
        });

        if (this.debugMode) {
          console.log(`[ToggleTester] ${scenario.name}: ${scenarioPassed ? 'PASSED' : 'FAILED'}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${scenario.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);

        if (this.debugMode) {
          console.error(`[ToggleTester] ${scenario.name} failed:`, error);
        }
      }
    });

    return results;
  }

  /**
   * Test rapid toggle changes to check for race conditions
   */
  static async testRapidToggles(
    map: maplibregl.Map | null,
    layerId: string,
    iterations: number = 10
  ): Promise<{
    success: boolean;
    errors: string[];
    finalState: boolean;
  }> {
    if (!map) {
      return {
        success: false,
        errors: ['Map is null'],
        finalState: false
      };
    }

    const errors: string[] = [];
    let currentState = false;

    for (let i = 0; i < iterations; i++) {
      try {
        currentState = !currentState;

        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', currentState ? 'visible' : 'none');
        }

        // Small delay to simulate real usage
        await new Promise(resolve => setTimeout(resolve, 10));

        // Verify the state
        const layer = map.getLayer(layerId);
        if (layer) {
          const visibility = map.getLayoutProperty(layerId, 'visibility');
          const actualVisibility = visibility !== 'none';

          if (actualVisibility !== currentState) {
            errors.push(`Iteration ${i + 1}: Expected ${currentState}, got ${actualVisibility}`);
          }
        }
      } catch (error) {
        errors.push(`Iteration ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: errors.length === 0,
      errors,
      finalState: currentState
    };
  }

  /**
   * Test zoom-based visibility behavior
   */
  static testZoomVisibility(
    map: maplibregl.Map | null,
    layerId: string,
    minZoom: number,
    maxZoom: number
  ): {
    success: boolean;
    errors: string[];
    results: any[];
  } {
    if (!map) {
      return {
        success: false,
        errors: ['Map is null'],
        results: []
      };
    }

    const errors: string[] = [];
    const results: any[] = [];
    const originalZoom = map.getZoom();

    try {
      // Test below min zoom
      map.setZoom(minZoom - 1);
      const belowMinVisibility = map.getLayoutProperty(layerId, 'visibility');
      results.push({
        zoom: minZoom - 1,
        expected: 'none',
        actual: belowMinVisibility,
        correct: belowMinVisibility === 'none'
      });

      // Test within range
      map.setZoom((minZoom + maxZoom) / 2);
      const withinRangeVisibility = map.getLayoutProperty(layerId, 'visibility');
      results.push({
        zoom: (minZoom + maxZoom) / 2,
        expected: 'visible',
        actual: withinRangeVisibility,
        correct: withinRangeVisibility === 'visible'
      });

      // Test above max zoom
      map.setZoom(maxZoom + 1);
      const aboveMaxVisibility = map.getLayoutProperty(layerId, 'visibility');
      results.push({
        zoom: maxZoom + 1,
        expected: 'none',
        actual: aboveMaxVisibility,
        correct: aboveMaxVisibility === 'none'
      });

      // Restore original zoom
      map.setZoom(originalZoom);

      const failedTests = results.filter(r => !r.correct);
      errors.push(...failedTests.map(r => `Zoom ${r.zoom}: Expected ${r.expected}, got ${r.actual}`));

      return {
        success: failedTests.length === 0,
        errors,
        results
      };
    } catch (error) {
      // Restore zoom on error
      map.setZoom(originalZoom);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        results
      };
    }
  }

  private static arraysEqual<T>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
}
