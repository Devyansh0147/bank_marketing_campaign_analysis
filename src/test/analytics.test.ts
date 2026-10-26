import { describe, it, expect } from "vitest";
import { parseCsv, kpis } from "@/lib/analytics";
describe("analytics", () => {
  it("computes subscription rate from semicolon CSV", () => {
    const r = parseCsv("age;campaign;y\n30;1;yes\n40;3;no\n50;2;no\n60;2;yes", "t.csv");
    const k = kpis(r.dataset!);
    expect(k.total).toBe(4); expect(k.yes).toBe(2); expect(k.rate).toBe(50); expect(k.avgContacts).toBe(2);
  });
  it("rejects files without outcome column", () => {
    expect(parseCsv("a,b\n1,2", "x.csv").ok).toBe(false);
  });
});
