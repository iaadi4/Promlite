export class Counter {
  private name: string;
  private help: string;
  private labels: string[];
  private values: Map<string, number>;

  constructor(name: string, help: string, labels: string[] = []) {
    this.name = name;
    this.help = help;
    this.labels = labels;
    this.values = new Map();
  }

  // Overload signatures
  // eslint-disable-next-line no-unused-vars
  inc(amount?: number): void;
  // eslint-disable-next-line no-unused-vars
  inc(labels: string[], amount?: number): void;

  // Implementation
  inc(arg1?: number | string[], arg2?: number): void {
    let labels: string[] = [];
    let amount: number;

    if (arg1 === undefined) {
      amount = 1;
    } else if (typeof arg1 === 'number') {
      amount = arg1;
    } else if (Array.isArray(arg1)) {
      labels = arg1;
      amount = arg2 ?? 1;  // default to 1
    } else {
      throw new TypeError(`Invalid argument type: ${typeof arg1}`);
    }

    if (labels.length !== this.labels.length) {
      throw new Error(`Label count mismatch, expected ${this.labels.length} but got ${labels.length}`);
    }

    if (typeof amount !== 'number' || isNaN(amount) || !Number.isFinite(amount)) {
      throw new TypeError(`Amount is not a valid finite number: ${amount}`);
    }

    if (amount < 0) {
      throw new Error('Counter cannot be decreased');
    }

    const key = JSON.stringify(labels);
    this.values.set(key, (this.values.get(key) || 0) + amount);
  }

  reset(): void {
    this.values.clear();
  }

  getValue(labels: string[] = []): number {
    if (labels.length !== this.labels.length) {
      throw new Error(`Label count mismatch, expected ${this.labels.length} but got ${labels.length}`);
    }
    const key = JSON.stringify(labels);
    return this.values.get(key) || 0;
  }

  toPrometheus(): string {
    let output = `# HELP ${this.name} ${this.help} \n`;
    output += `# TYPE ${this.name} counter\n`;

    for (const [key, value] of this.values) {
      const splitKeys = JSON.parse(key);
      output += `${this.name}`;
      for (let i=0; i<this.labels.length; i++) {
        if (i === 0) {
          output += '{';
        }
        output += `${this.labels[i]}="${splitKeys[i]}"`;
        if (i !== this.labels.length - 1) {
          output += ', ';
        }
        if (i === this.labels.length-1) {
          output += '}';
        }
      }
      output += ` ${value}\n`;
    }
    return output;
  }
}
