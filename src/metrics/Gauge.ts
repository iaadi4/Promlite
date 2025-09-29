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

    // value can be any finite number (negative, positive or zero)
    inc(labels: string[] = [], value: number = 1) {
        if(typeof labels == 'number') {
            value = labels;
            labels = [];
        }

        if(value == undefined) {
            value = 1;
        }

        if(typeof value != 'number') {
            throw new TypeError(`Value is not a valid number, expected 'number' found ${typeof value}`);
        }

        if(isNaN(value)) {
            throw new TypeError(`Value is NaN`);
        }

        if(!Number.isFinite(value)) {
            throw new TypeError(`Value is not a finite number: ${value}`);
        }

        const key = JSON.stringify(labels);
        this.values.set(key, (this.values.get(key) || 0) + value);
    }

    dec(labels: string[] = [], value: number = 1) {
        if(typeof labels == 'number') {
            value = labels;
            labels = [];
        }

        if(value == undefined) {
            value = 1;
        }

        if(typeof value != 'number') {
            throw new TypeError(`Value is not a valid number, expected 'number' found ${typeof value}`);
        }

        if(isNaN(value)) {
            throw new TypeError(`Value is NaN`);
        }

        if(!Number.isFinite(value)) {
            throw new TypeError(`Value is not a finite number: ${value}`);
        }

        const key = JSON.stringify(labels);
        this.values.set(key, (this.values.get(key) || 0) - value);
    }

    get(labels: string[] = []) {
        if(labels.length !== this.labels.length) {
            throw new Error("Label count mismatch");
        }

        const key = JSON.stringify(labels);
        return this.values.get(key) || 0;
    }

    reset() {
        this.values.clear();
    }

    toPrometheus() {
        let output = `# HELP ${this.name} ${this.help} \n`;
        output += `# TYPE ${this.name} gauge \n`;

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