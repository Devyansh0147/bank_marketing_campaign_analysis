import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useDataset } from "@/lib/dataset-store";
import { findTarget, isYes, toCsv } from "@/lib/analytics";
import { Card, DemoBanner, EmptyState } from "@/components/app/ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/explorer")({
  head: () => ({
    meta: [
      { title: "Data Explorer — CampaignLens" },
      { name: "description", content: "Search, filter and export campaign records." },
      { property: "og:title", content: "Data Explorer — CampaignLens" },
      { property: "og:description", content: "Searchable, paginated table of campaign records with CSV export." },
    ],
  }),
  component: Explorer,
});

const PAGE = 25;
const FILTER_COLS = ["job", "contact", "month", "education", "marital"];

function Explorer() {
  const { dataset } = useDataset();
  const [q, setQ] = useState("");
  const [outcome, setOutcome] = useState("all");
  const [filterCol, setFilterCol] = useState<string>("none");
  const [filterVal, setFilterVal] = useState<string>("all");
  const [page, setPage] = useState(0);

  const target = dataset ? findTarget(dataset.columns) : null;
  const available = dataset ? FILTER_COLS.filter((c) => dataset.columns.includes(c)) : [];
  const values = useMemo(
    () => (dataset && filterCol !== "none" ? [...new Set(dataset.rows.map((r) => String(r[filterCol])))].sort() : []),
    [dataset, filterCol],
  );

  const rows = useMemo(() => {
    if (!dataset) return [];
    const s = q.trim().toLowerCase();
    return dataset.rows.filter((r) => {
      if (outcome !== "all" && target && isYes(r[target]) !== (outcome === "yes")) return false;
      if (filterCol !== "none" && filterVal !== "all" && String(r[filterCol]) !== filterVal) return false;
      if (s && !dataset.columns.some((c) => String(r[c] ?? "").toLowerCase().includes(s))) return false;
      return true;
    });
  }, [dataset, q, outcome, filterCol, filterVal, target]);

  if (!dataset) return <EmptyState />;
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const p = Math.min(page, pages - 1);
  const slice = rows.slice(p * PAGE, p * PAGE + PAGE);

  const download = () => {
    const blob = new Blob([toCsv(rows, dataset.columns)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `filtered-${dataset.source === "demo" ? "demo-" : ""}records.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <DemoBanner />
      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Search records" placeholder="Search all columns…" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} className="pl-9" />
          </div>
          <Select value={outcome} onValueChange={(v) => { setOutcome(v); setPage(0); }}>
            <SelectTrigger className="w-[150px]" aria-label="Outcome filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All outcomes</SelectItem>
              <SelectItem value="yes">Subscribed</SelectItem>
              <SelectItem value="no">Not subscribed</SelectItem>
            </SelectContent>
          </Select>
          {available.length > 0 && (
            <Select value={filterCol} onValueChange={(v) => { setFilterCol(v); setFilterVal("all"); setPage(0); }}>
              <SelectTrigger className="w-[150px]" aria-label="Filter column"><SelectValue placeholder="Filter by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No column filter</SelectItem>
                {available.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          {filterCol !== "none" && (
            <Select value={filterVal} onValueChange={(v) => { setFilterVal(v); setPage(0); }}>
              <SelectTrigger className="w-[160px]" aria-label="Filter value"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any {filterCol}</SelectItem>
                {values.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" onClick={download} disabled={!rows.length}><Download className="h-4 w-4" /> CSV</Button>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                {dataset.columns.map((c) => (
                  <th key={c} className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.map((r, i) => (
                <tr key={i} className="border-t transition-colors hover:bg-muted/40">
                  {dataset.columns.map((c) => (
                    <td key={c} className="whitespace-nowrap px-3 py-2 tabular-nums">
                      {c === target ? (
                        <span className={isYes(r[c]) ? "rounded bg-accent px-1.5 py-0.5 text-xs font-medium text-accent-foreground" : "text-xs text-muted-foreground"}>{String(r[c])}</span>
                      ) : String(r[c] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
              {!slice.length && (
                <tr><td colSpan={dataset.columns.length} className="px-3 py-12 text-center text-sm text-muted-foreground">No records match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{rows.length.toLocaleString()} of {dataset.rows.length.toLocaleString()} records</span>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" className="h-8 w-8" disabled={p === 0} onClick={() => setPage(p - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
            <span className="tabular-nums">Page {p + 1} / {pages}</span>
            <Button size="icon" variant="outline" className="h-8 w-8" disabled={p >= pages - 1} onClick={() => setPage(p + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
