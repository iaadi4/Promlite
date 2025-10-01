export { Counter } from './metrics/Counter.js';
export { Gauge } from './metrics/Gauge.js';
export { Histogram } from './metrics/Histogram.js';

// Re-export types for convenience
export type { Counter as CounterType } from './metrics/Counter.js';
export type { Gauge as GaugeType } from './metrics/Gauge.js';
export type { Histogram as HistogramType } from './metrics/Histogram.js';

import { Counter } from './metrics/Counter.js';
import { Gauge } from './metrics/Gauge.js';
import { Histogram } from './metrics/Histogram.js';

type Metric = Counter | Gauge | Histogram;

/**
 * Registry class to manage multiple metrics and provide a central endpoint
 * for collecting all metrics in Prometheus format
 */
export class Registry {
  private _metrics: Map<string, Metric> = new Map();

  /**
   * Register a metric with the registry
   * @param name - Unique name for the metric
   * @param metric - The metric instance to register
   */
  register(name: string, metric: Metric): void {
    if (this._metrics.has(name)) {
      throw new Error(`Metric with name '${name}' is already registered`);
    }
    this._metrics.set(name, metric);
  }

  /**
   * Unregister a metric from the registry
   * @param name - Name of the metric to remove
   */
  unregister(name: string): boolean {
    return this._metrics.delete(name);
  }

  /**
   * Get a registered metric by name
   * @param name - Name of the metric to retrieve
   * @returns The metric instance or undefined if not found
   */
  getMetric(name: string): Metric | undefined {
    return this._metrics.get(name);
  }

  /**
   * Clear all registered metrics
   */
  clear(): void {
    this._metrics.clear();
  }

  /**
   * Get all registered metric names
   * @returns Array of metric names
   */
  getMetricNames(): string[] {
    return Array.from(this._metrics.keys());
  }

  /**
   * Generate Prometheus format output for all registered metrics
   * @returns String containing all metrics in Prometheus format
   */
  metrics(): string {
    let output = '';
    for (const [, metric] of this._metrics) {
      output += metric.toPrometheus();
    }
    return output;
  }

  /**
   * Reset all registered metrics
   */
  resetAll(): void {
    for (const [, metric] of this._metrics) {
      metric.reset();
    }
  }
}

// Default registry instance
export const register = new Registry();
