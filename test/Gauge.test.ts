import { Gauge } from "../src/metrics/Gauge";

let gauge: Gauge;
let gauge2: Gauge;

beforeAll(() => {
    gauge = new Gauge(
        "test gauge",
        "simple gauge testing"
    );

    gauge2 = new Gauge(
        "test gauge 2",
        "gaug with labels",
        ["method", "route"]
    );
});

describe("Gauge", () => {
    it("should return zero when initialized", () => {
        expect(gauge.get()).toBe(0);
    })

    it("should set value", () => {
        gauge.set(10);
        expect(gauge.get()).toBe(10);
    });

    it("should increment value", () => {
        gauge.inc();
        expect(gauge.get()).toBe(11);
        gauge.inc(4);
        expect(gauge.get()).toBe(15);
    });

    it("should decrement value", () => {
        gauge.dec();
        expect(gauge.get()).toBe(14);
        gauge.dec(4);
        expect(gauge.get()).toBe(10);
    });

    it("should set value with labels", () => {
        gauge2.set(["GET", "/test"], 5);
        expect(gauge2.get(["GET", "/test"])).toBe(5);
    });

    it("should increment value with labels", () => {
        gauge2.inc(["GET", "/test"]);
        expect(gauge2.get(["GET", "/test"])).toBe(6);
        gauge2.inc(["GET", "/test"], 4);
        expect(gauge2.get(["GET", "/test"])).toBe(10);
    });

    it("should decrement value with labels", () => {
        gauge2.dec(["GET", "/test"]);
        expect(gauge2.get(["GET", "/test"])).toBe(9);
        gauge2.dec(["GET", "/test"], 4);
        expect(gauge2.get(["GET", "/test"])).toBe(5);
    });

    it("should throw error on invalid increment/decrement/set values", () => {
        expect(() => gauge.inc(NaN)).toThrow(TypeError);
        expect(() => gauge.dec(Infinity)).toThrow(TypeError);
        expect(() => gauge.set("string" as unknown as number)).toThrow(TypeError);
        expect(() => gauge2.inc(["GET", "/test"], NaN)).toThrow(TypeError);
        expect(() => gauge2.dec(["GET", "/test"], Infinity)).toThrow(TypeError);
        expect(() => gauge2.set(["GET", "/test"], "string" as unknown as number)).toThrow(TypeError);
    });

    it("should reset values", () => {
        gauge.set(10);
        gauge2.set(["GET", "/test"], 5);
        gauge.reset();
        gauge2.reset();
        expect(gauge.get()).toBe(0);
        expect(gauge2.get(["GET", "/test"])).toBe(0);
    });

    it("should export in Prometheus format", () => {
        gauge.set(10);
        gauge2.set(["GET", "/test"], 5);
        const prom1 = gauge.toPrometheus();
        const prom2 = gauge2.toPrometheus();
        expect(prom1).toBe(`# HELP test gauge simple gauge testing \n# TYPE test gauge gauge \ntest gauge 10\n`);
        expect(prom2).toBe(`# HELP test gauge 2 gaug with labels \n# TYPE test gauge 2 gauge \ntest gauge 2 {method="GET", route="/test"} 5\n`);
    });
});