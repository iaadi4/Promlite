import { Histogram } from "../src/metrics/Histogram";

let histogram: Histogram;
let histogram2: Histogram;

beforeAll(() => {
    histogram = new Histogram(
        "test histogram",
        "simple histogram testing",
        [0.1, 0.5, 1, 5, 10]
    );

    histogram2 = new Histogram(
        "test histogram 2",
        "histogram with labels",
        [0.1, 0.5, 1, 5, 10],
        ["method", "route"]
    );
});

describe("Histogram", () => {
    it("should observe values", () => {
        histogram.observe(0.3);
        histogram.observe(0.7);
        histogram.observe(2);
        histogram.observe(7);
        histogram.observe(15);
        expect(histogram.get().totalCount).toBe(5);
        expect(histogram.get().totalSum).toBe(25);
    });

    it("should observe values with labels", () => {
        histogram2.observe(["GET", "/test"], 0.2);
        histogram2.observe(["GET", "/test"], 0.6);
        histogram2.observe(["GET", "/test"], 3);
        histogram2.observe(["GET", "/test"], 8);
        histogram2.observe(["GET", "/test"], 20);
        expect(histogram2.get(["GET", "/test"]).totalCount).toBe(5);
        expect(histogram2.get(["GET", "/test"]).totalSum).toBe(31.8);
    });

    it("should return prometheus format", () => {
        const prom1 = histogram.toPrometheus();
        const prom2 = histogram2.toPrometheus();
        expect(prom1).toBe(`# HELP test histogram simple histogram testing\n# TYPE test histogram histogram\ntest histogram_bucket{le="0.1"} 0\n` +
            `test histogram_bucket{le="0.5"} 1\n` +
            `test histogram_bucket{le="1"} 2\n` +
            `test histogram_bucket{le="5"} 3\n` +
            `test histogram_bucket{le="10"} 4\n` +
            `test histogram_bucket{le="+Inf"} 5\n` +
            `test histogram_sum 25\n` +
            `test histogram_count 5\n`
        );
        expect(prom2).toBe(`# HELP test histogram 2 histogram with labels\n# TYPE test histogram 2 histogram\ntest histogram 2_bucket{method="GET", route="/test", le="0.1"} 0\n` +
            `test histogram 2_bucket{method="GET", route="/test", le="0.5"} 1\n` +
            `test histogram 2_bucket{method="GET", route="/test", le="1"} 2\n` +
            `test histogram 2_bucket{method="GET", route="/test", le="5"} 3\n` +
            `test histogram 2_bucket{method="GET", route="/test", le="10"} 4\n` +
            `test histogram 2_bucket{method="GET", route="/test", le="+Inf"} 5\n` +
            `test histogram 2_sum{method="GET", route="/test"} 31.8\n` +
            `test histogram 2_count{method="GET", route="/test"} 5\n`);
    });

    it("should throw error on invalid observe values", () => {
        expect(() => histogram.observe(NaN)).toThrow(TypeError);
        expect(() => histogram.observe(Infinity)).toThrow(TypeError);
        expect(() => histogram2.observe(["GET", "/test"], NaN)).toThrow(TypeError);
        expect(() => histogram2.observe(["GET", "/test"], Infinity)).toThrow(TypeError);
    });

    it("should reset values", () => {
        histogram.reset();
        histogram2.reset();
        expect(histogram.get().totalCount).toBe(0);
        expect(histogram.get().totalSum).toBe(0);
        expect(histogram2.get(["GET", "/test"]).totalCount).toBe(0);
        expect(histogram2.get(["GET", "/test"]).totalSum).toBe(0);
    });

    it("should throw error on label count mismatch", () => {
        expect(() => {
            histogram2.observe(["GET"], 1);
        }).toThrow("Label count mismatch, expected 2 but got 1");
        expect(() => {
            histogram2.get(["GET"]);
        }).toThrow("Label count mismatch, expected 2 but got 1");
    });
});