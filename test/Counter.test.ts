import { Counter } from "../src/metrics/Counter.js";

let counter: Counter;

beforeAll(() => {
    counter = new Counter(
        "test",
        "test counter",
        ["method", "route"]
    )
})

describe("Counter", () => {
    it("should return zero for uninitialized labels", () => {
        expect(counter.getValue(["put", "/update"])).toBe(0);
    });

    it("should increment by 1", () => {
        counter.inc(["get", "/"]);
        expect(counter.getValue(["get", "/"])).toBe(1);
    })

    it("should reset to zero", () => {
        counter.reset();
        expect(counter.getValue(["get", "/"])).toBe(0);
    });

    it("should increment by a custom amount", () => {
        counter.inc(["get", "/"], 5);
        expect(counter.getValue(["get", "/"])).toBe(5);
    });

    it("should throw error on label count mismatch", () => {
        expect(() => {
            counter.inc(["get"]);
        }).toThrow("Label count mismatch!");

        expect(() => {
            counter.getValue(["get"]);
        }).toThrow("Label count mismatch!");
    });

    it("should throw error when decrementing", () => {
        expect(() => {
            counter.inc(["get", "/"], -1);
        }).toThrow("Counter cannot be decreased!");
    });

    it("should return Prometheus format", () => {
        const prometheus = counter.toPrometheus();
        expect(prometheus).toBe(`# HELP test test counter \n# TYPE test counter\ntest {method="get", route="/"}: 5\n`);
    });

    it("should handle multiple label combinations", () => {
        counter.inc(["post", "/submit"], 3);
        expect(counter.getValue(["post", "/submit"])).toBe(3);
        expect(counter.getValue(["get", "/"])).toBe(5);
    });

    it("should return correct Prometheus format with multiple labels", () => {
        const prometheus = counter.toPrometheus();
        expect(prometheus).toBe(`# HELP test test counter \n# TYPE test counter\ntest {method="get", route="/"}: 5\ntest {method="post", route="/submit"}: 3\n`);
    });
});