export class Histogram {
  private name: string;
  private help: string;
  private buckets: number[];
  private labels: string[];
  private counts: Map<string, Map<number, number>>;
  private totalSum: Map<string, number>;
  private totalCount: Map<string, number>;

  constructor(
    name: string,
    help: string,
    buckets: number[],
    labels: string[] = []
  ) {
    this.name = name;
    this.help = help;
    this.buckets = [...buckets].sort((a, b) => a - b);
    this.labels = labels;
    this.counts = new Map();
    this.totalSum = new Map();
    this.totalCount = new Map();
  }

  // Overload signatures
  // eslint-disable-next-line no-unused-vars
  observe(value: number): void;
  // eslint-disable-next-line no-unused-vars
  observe(labels: string[], value: number): void;

  // Implementation
  observe(arg1: number | string[], arg2?: number): void {
    let labels: string[] = [];
    let value: number;

    if (typeof arg1 === 'number') {
      value = arg1;
    } else if (Array.isArray(arg1)) {
      if (typeof arg2 !== 'number') {
        throw new TypeError('Value must be a number');
      }
      labels = arg1;
      value = arg2;
    } else {
      throw new TypeError(`Invalid argument type: ${typeof arg1}`);
    }

    if (labels.length !== this.labels.length) {
      throw new Error(
        `Label count mismatch, expected ${this.labels.length} but got ${labels.length}`
      );
    }

    if (typeof value !== 'number' || isNaN(value) || !Number.isFinite(value)) {
      throw new TypeError(`Value is not a valid finite number: ${value}`);
    }

    const key = JSON.stringify(labels);

    // init if first time
    if (!this.counts.has(key)) {
      this.counts.set(key, new Map(this.buckets.map(b => [b, 0])));
      this.totalSum.set(key, 0);
      this.totalCount.set(key, 0);
    }

    // increment all buckets >= value
    const bucketMap = this.counts.get(key) ?? new Map();
    for (const bucket of this.buckets) {
      if (value <= bucket) {
        bucketMap.set(bucket, (bucketMap.get(bucket) || 0) + 1);
      }
    }

    // update total sum and count
    this.totalSum.set(key, (this.totalSum.get(key) || 0) + value);
    this.totalCount.set(key, (this.totalCount.get(key) || 0) + 1);
  }

  get(labels: string[] = []): { totalCount: number; totalSum: number } {
    if (labels.length !== this.labels.length) {
      throw new Error(
        `Label count mismatch, expected ${this.labels.length} but got ${labels.length}`
      );
    }

    const key = JSON.stringify(labels);
    return {
      totalCount: this.totalCount.get(key) || 0,
      totalSum: this.totalSum.get(key) || 0,
    };
  }

  reset(): void {
    this.counts.clear();
    this.totalSum.clear();
    this.totalCount.clear();
  }

  toPrometheus(): string {
    let output = `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} histogram\n`;

    for (const [key, bucketMap] of this.counts) {
      const splitKeys = JSON.parse(key);

      // each bucket
      for (const bucket of this.buckets) {
        output += `${this.name}_bucket`;
        if (this.labels.length > 0) {
          output += '{';
          for (let i = 0; i < this.labels.length; i++) {
            output += `${this.labels[i]}="${splitKeys[i]}", `;
          }
          output += `le="${bucket}"}`;
        } else {
          output += `{le="${bucket}"}`;
        }
        output += ` ${bucketMap.get(bucket) || 0}\n`;
      }

      // +Inf bucket (always == count)
      output += `${this.name}_bucket`;
      if (this.labels.length > 0) {
        output += '{';
        for (let i = 0; i < this.labels.length; i++) {
          output += `${this.labels[i]}="${splitKeys[i]}", `;
        }
        output += 'le="+Inf"}';
      } else {
        output += '{le="+Inf"}';
      }
      output += ` ${this.totalCount.get(key) || 0}\n`;

      // sum
      output += `${this.name}_sum`;
      if (this.labels.length > 0) {
        output += '{';
        for (let i = 0; i < this.labels.length; i++) {
          output += `${this.labels[i]}="${splitKeys[i]}"`;
          if (i < this.labels.length - 1) {
            output += ', ';
          }
        }
        output += '}';
      }
      output += ` ${this.totalSum.get(key) || 0}\n`;

      // count
      output += `${this.name}_count`;
      if (this.labels.length > 0) {
        output += '{';
        for (let i = 0; i < this.labels.length; i++) {
          output += `${this.labels[i]}="${splitKeys[i]}"`;
          if (i < this.labels.length - 1) {
            output += ', ';
          }
        }
        output += '}';
      }
      output += ` ${this.totalCount.get(key) || 0}\n`;
    }

    return output;
  }
}
