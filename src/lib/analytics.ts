// Pure data utilities: parsing, validation, aggregation. No fabricated numbers.
import Papa from "papaparse";

export type Row = Record<string, string | number>;

export interface Dataset {
  name: string;
  source: "upload" | "demo";
  rows: Row[];
  columns: string[];
  loadedAt: string;
  warnings: string[];
}

export const TARGET_CANDIDATES = ["y", "deposit", "subscribed", "outcome", "target"];
const YES = new Set(["yes", "1", "true", "y", "subscribed"]);
export const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

export function findTarget(columns: string[]): string | null {
  const lower = columns.map((c) => c.toLowerCase());
  for (const t of TARGET_CANDIDATES) {
    const i = lower.indexOf(t);
    if (i >= 0) return columns[i]!;
  }
  return null;
}

export function isYes(v: unknown) {
  return YES.has(String(v ?? "").trim().toLowerCase());
}

export interface ParseResult {
  ok: boolean;
  dataset?: Dataset;
  error?: string;
}

export function parseCsv(text: string, name: string): ParseResult {
  const result = Papa.parse<Row>(text.trim(), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    delimitersToGuess: [",", ";", "\t", "|"],
    transformHeader: (h) => h.trim().replace(/^"|"$/g, ""),
  });
  const rows = result.data;
  const columns = (result.meta.fields ?? []).filter(Boolean);
  if (!rows.length || columns.length < 2) {
    return { ok: false, error: "The file has no readable rows or columns. Check that it is a CSV with a header row." };
  }
  const target = findTarget(columns);
  if (!target) {
    return {
      ok: false,
      error: `No outcome column found. Expected one of: ${TARGET_CANDIDATES.join(", ")} (values yes/no).`,
    };
  }
  const warnings: string[] = [];
  if (result.errors.length) warnings.push(`${result.errors.length} row(s) had formatting issues and may be incomplete.`);
  const recognised = ["age", "job", "marital", "education", "contact", "month", "campaign"].filter((c) =>
    columns.map((x) => x.toLowerCase()).includes(c),
  );
  if (recognised.length < 3) warnings.push("Few standard bank-marketing columns detected; some views will be hidden.");
  return {
    ok: true,
    dataset: { name, source: "upload", rows, columns, loadedAt: new Date().toISOString(), warnings },
  };
}

export function col(ds: Dataset, name: string): string | null {
  return ds.columns.find((c) => c.toLowerCase() === name) ?? null;
}

export interface Group {
  key: string;
  total: number;
  yes: number;
  rate: number; // 0..100
}

export function groupRate(rows: Row[], keyFn: (r: Row) => string | null, target: string): Group[] {
  const map = new Map<string, { total: number; yes: number }>();
  for (const r of rows) {
    const k = keyFn(r);
    if (k == null || k === "") continue;
    const g = map.get(k) ?? { total: 0, yes: 0 };
    g.total++;
    if (isYes(r[target])) g.yes++;
    map.set(k, g);
  }
  return [...map.entries()].map(([key, g]) => ({ key, ...g, rate: g.total ? (g.yes / g.total) * 100 : 0 }));
}

export function byColumn(ds: Dataset, name: string): Group[] | null {
  const c = col(ds, name);
  const t = findTarget(ds.columns);
  if (!c || !t) return null;
  return groupRate(ds.rows, (r) => (r[c] == null ? null : String(r[c])), t).sort((a, b) => b.total - a.total);
}

export function ageGroups(ds: Dataset): Group[] | null {
  const c = col(ds, "age");
  const t = findTarget(ds.columns);
  if (!c || !t) return null;
  const order = ["<25", "25–34", "35–44", "45–54", "55–64", "65+"];
  const g = groupRate(
    ds.rows,
    (r) => {
      const a = Number(r[c]);
      if (!Number.isFinite(a)) return null;
      if (a < 25) return "<25";
      if (a < 35) return "25–34";
      if (a < 45) return "35–44";
      if (a < 55) return "45–54";
      if (a < 65) return "55–64";
      return "65+";
    },
    t,
  );
  return g.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
}

export function monthGroups(ds: Dataset): Group[] | null {
  const g = byColumn(ds, "month");
  if (!g) return null;
  return g
    .filter((x) => MONTHS.includes(x.key.toLowerCase().slice(0, 3)))
    .sort((a, b) => MONTHS.indexOf(a.key.toLowerCase().slice(0, 3)) - MONTHS.indexOf(b.key.toLowerCase().slice(0, 3)))
    .map((x) => ({ ...x, key: x.key.slice(0, 1).toUpperCase() + x.key.slice(1, 3).toLowerCase() }));
}

export function campaignGroups(ds: Dataset): Group[] | null {
  const c = col(ds, "campaign");
  const t = findTarget(ds.columns);
  if (!c || !t) return null;
  const order = ["1", "2", "3", "4–5", "6–10", "11+"];
  return groupRate(
    ds.rows,
    (r) => {
      const n = Number(r[c]);
      if (!Number.isFinite(n)) return null;
      if (n <= 3) return String(n < 1 ? 1 : n);
      if (n <= 5) return "4–5";
      if (n <= 10) return "6–10";
      return "11+";
    },
    t,
  ).sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
}

export interface Kpis {
  total: number;
  yes: number;
  rate: number;
  avgContacts: number | null;
}

export function kpis(ds: Dataset): Kpis {
  const t = findTarget(ds.columns)!;
  const total = ds.rows.length;
  const yes = ds.rows.filter((r) => isYes(r[t])).length;
  const c = col(ds, "campaign");
  let avgContacts: number | null = null;
  if (c) {
    const vals = ds.rows.map((r) => Number(r[c])).filter(Number.isFinite);
    avgContacts = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }
  return { total, yes, rate: total ? (yes / total) * 100 : 0, avgContacts };
}

export const SEGMENT_FIELDS: { key: string; label: string }[] = [
  { key: "job", label: "Occupation" },
  { key: "education", label: "Education" },
  { key: "marital", label: "Marital status" },
  { key: "housing", label: "Housing loan" },
  { key: "loan", label: "Personal loan" },
  { key: "default", label: "Credit default" },
];

export const CAMPAIGN_FIELDS: { key: string; label: string }[] = [
  { key: "contact", label: "Contact method" },
  { key: "poutcome", label: "Previous campaign outcome" },
  { key: "day_of_week", label: "Day of week" },
];

export interface Insight {
  title: string;
  detail: string;
  figure: string;
  caveat: string;
}

const MIN_N = 30;

export function insights(ds: Dataset): Insight[] {
  const out: Insight[] = [];
  const k = kpis(ds);
  out.push({
    title: "Baseline subscription rate",
    detail: `${k.yes.toLocaleString()} of ${k.total.toLocaleString()} contacted customers subscribed.`,
    figure: `${k.rate.toFixed(1)}%`,
    caveat: "All comparisons below are relative to this baseline.",
  });
  const compare = (label: string, groups: Group[] | null) => {
    if (!groups) return;
    const valid = groups.filter((g) => g.total >= MIN_N);
    if (valid.length < 2) return;
    const s = [...valid].sort((a, b) => b.rate - a.rate);
    const hi = s[0]!;
    const lo = s[s.length - 1]!;
    if (hi.rate - lo.rate < 2) return;
    out.push({
      title: `${label}: "${hi.key}" responds most`,
      detail: `"${hi.key}" converted at ${hi.rate.toFixed(1)}% (${hi.yes}/${hi.total}) versus "${lo.key}" at ${lo.rate.toFixed(1)}% (${lo.yes}/${lo.total}).`,
      figure: `+${(hi.rate - lo.rate).toFixed(1)} pts`,
      caveat: `Association only, not causation. Groups with fewer than ${MIN_N} records are excluded.`,
    });
  };
  compare("Contact method", byColumn(ds, "contact"));
  compare("Previous outcome", byColumn(ds, "poutcome"));
  compare("Age group", ageGroups(ds));
  compare("Occupation", byColumn(ds, "job"));
  compare("Month", monthGroups(ds));
  const cg = campaignGroups(ds);
  if (cg && cg.length >= 2) {
    const first = cg[0]!;
    const last = cg[cg.length - 1]!;
    if (first.total >= MIN_N && last.total >= MIN_N)
      out.push({
        title: "Contact frequency and response",
        detail: `Customers contacted ${first.key} time(s) converted at ${first.rate.toFixed(1)}% (n=${first.total}); those contacted ${last.key} times at ${last.rate.toFixed(1)}% (n=${last.total}).`,
        figure: `${(first.rate - last.rate).toFixed(1)} pts`,
        caveat: "Customers receiving many calls may differ systematically (e.g. harder to reach); this does not prove extra calls reduce conversions.",
      });
  }
  return out;
}

export function toCsv(rows: Row[], columns: string[]) {
  return Papa.unparse({ fields: columns, data: rows.map((r) => columns.map((c) => r[c])) });
}

// ---------- Demo data (synthetic, clearly labelled) ----------
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export function makeDemoDataset(n = 1500): Dataset {
  const r = rng(42);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const jobs = ["admin.", "technician", "services", "management", "retired", "blue-collar", "student", "self-employed", "entrepreneur", "unemployed"];
  const rows: Row[] = [];
  for (let i = 0; i < n; i++) {
    const age = Math.round(20 + r() * 50 + (r() < 0.08 ? 15 : 0));
    const job = age > 62 ? "retired" : age < 25 && r() < 0.4 ? "student" : pick(jobs);
    const contact = r() < 0.65 ? "cellular" : r() < 0.7 ? "telephone" : "unknown";
    const month = pick(MONTHS.concat(["may", "may", "jun", "jul", "aug"]));
    const campaign = Math.max(1, Math.round(-Math.log(r()) * 2.2));
    const poutcome = r() < 0.8 ? "unknown" : pick(["failure", "success", "other"]);
    let p = 0.08;
    if (contact === "cellular") p += 0.04;
    if (poutcome === "success") p += 0.45;
    if (job === "student" || job === "retired") p += 0.12;
    if (["mar", "sep", "oct", "dec"].includes(month)) p += 0.2;
    p -= Math.min(0.06, (campaign - 1) * 0.012);
    rows.push({
      age,
      job,
      marital: pick(["married", "married", "single", "divorced"]),
      education: pick(["primary", "secondary", "secondary", "tertiary", "unknown"]),
      default: r() < 0.02 ? "yes" : "no",
      balance: Math.round(r() * 4000 - 300),
      housing: r() < 0.55 ? "yes" : "no",
      loan: r() < 0.16 ? "yes" : "no",
      contact,
      month,
      campaign,
      previous: poutcome === "unknown" ? 0 : 1 + Math.floor(r() * 3),
      poutcome,
      y: r() < p ? "yes" : "no",
    });
  }
  return {
    name: "Demo dataset (synthetic)",
    source: "demo",
    rows,
    columns: Object.keys(rows[0]),
    loadedAt: new Date().toISOString(),
    warnings: ["Synthetic sample generated in the browser for demonstration. Not real results."],
  };
}
