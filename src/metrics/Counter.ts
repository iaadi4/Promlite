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

    inc(labels: string[] = [], amount: number = 1) {
        if(amount < 0) {
            throw new Error("Counter cannot be decreased!");
        }
        if(labels.length !== this.labels.length) {
            throw new Error("Label count mismatch!");
        }
        const key = JSON.stringify(labels);
        this.values.set(key, (this.values.get(key) || 0) + amount);
    }

    reset() {
        this.values.clear();
    }

    getValue(labels: string[] = []) {
        if(labels.length !== this.labels.length) {
            throw new Error("Label count mismatch!");
        }
        const key = JSON.stringify(labels);
        return this.values.get(key) || 0;
    }

    toPrometheus() {
        let output = `# HELP ${this.name} ${this.help} \n`;
        output += `# TYPE ${this.name} counter\n`;

        for(const [key, value] of this.values) {
            const splitKeys = JSON.parse(key);
            output += `${this.name} {`;
            for(let i=0; i<this.labels.length; i++) {
                output += `${this.labels[i]}="${splitKeys[i]}"`;
                if(i != this.labels.length-1) {
                    output += ", ";
                }
            }
            output += `}: ${value}\n`;
        }
        return output;
    }
}