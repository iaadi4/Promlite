export class Gauge {
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
    inc(value?: number): void;
    inc(labels: string[], value?: number): void;

    // Implementation
    inc(arg1?: number | string[], arg2?: number): void {
        let labels: string[] = [];
        let value: number;

        if (typeof arg1 === 'number' || arg1 === undefined) {
            value = arg1 ?? 1; // default to 1
        } else {
            labels = arg1;
            value = arg2 ?? 1; // default to 1
        }

        if(labels.length !== this.labels.length) {
            throw new Error(`Label count mismatch, expected ${this.labels.length} but got ${labels.length}`);
        }

        if (typeof value !== 'number' || isNaN(value) || !Number.isFinite(value)) {
            throw new TypeError(`Value is not a valid finite number: ${value}`);
        }

        const key = JSON.stringify(labels);
        this.values.set(key, (this.values.get(key) || 0) + value);
    }

    // Overload signatures
    dec(value?: number): void;
    dec(labels: string[], value?: number): void;

    // Implementation
    dec(arg1?: number | string[], arg2?: number): void {
        let labels: string[] = [];
        let value: number;

        if (typeof arg1 === 'number' || arg1 === undefined) {
            value = arg1 ?? 1; // default to 1
        } else {
            labels = arg1;
            value = arg2 ?? 1; // default to 1
        }

        if(labels.length !== this.labels.length) {
            throw new Error(`Label count mismatch, expected ${this.labels.length} but got ${labels.length}`);
        }

        if (typeof value !== 'number' || isNaN(value) || !Number.isFinite(value)) {
            throw new TypeError(`Value is not a valid finite number: ${value}`);
        }

        const key = JSON.stringify(labels);
        this.values.set(key, (this.values.get(key) || 0) - value);
    }

    // Overload signatures
    set(value: number): void;
    set(labels: string[], value: number): void;

    // Implementation
    set(arg1: number | string[], arg2?: number): void {
        let labels: string[] = [];
        let value: number;

        if (typeof arg1 === "number") {
            value = arg1;
        } else if (Array.isArray(arg1)) {
            labels = arg1;
            value = arg2 ?? 0;
        } else {
            throw new TypeError(`Labels must be an array of strings, got ${typeof arg1}`);
        }

        if (typeof value !== "number" || isNaN(value) || !Number.isFinite(value)) {
            throw new TypeError(`Value is not a valid finite number: ${value}`);
        }

        const key = JSON.stringify(labels);
        this.values.set(key, value);
    }

    get(labels: string[] = []) {
        if(labels.length !== this.labels.length) {
            throw new Error("Label count mismatch");
        }

        const key = JSON.stringify(labels);
        return this.values.get(key) || 0;
    }

    // clear all values
    reset() {
        this.values.clear();
    }

    toPrometheus() {
        let output = `# HELP ${this.name} ${this.help} \n`;
        output += `# TYPE ${this.name} gauge \n`;

        for(const [key, value] of this.values) {
            const splitKeys = JSON.parse(key);
            output += `${this.name} `;
            for(let i=0; i<this.labels.length; i++) {
                if(i === 0) {
                    output += `{`;
                }
                output += `${this.labels[i]}="${splitKeys[i]}"`;
                if(i != this.labels.length-1) {
                    output += ", ";
                }
                if(i === this.labels.length-1) {
                    output += `} `;
                }
            }
            output += `${value}\n`;
        }
        return output;
    }
}