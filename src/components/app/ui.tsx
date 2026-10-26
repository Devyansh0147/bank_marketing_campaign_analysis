import type { ReactNode } from "react";
import { DatabaseZap, FlaskConical, Upload } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { useDataset } from "@/lib/dataset-store";
import { makeDemoDataset, type Group } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function Card({ title, subtitle, children, className, action }: { title?: string; subtitle?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={cn("card-surface p-5", className)}>
      {title && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Kpi({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon: ReactNode }) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">{icon}</span>
      </div>
      <div className="mt-3 font-display text-3xl font-bold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function PageIntro({ children }: { children: ReactNode }) {
  return <p className="mb-6 max-w-3xl text-sm text-muted-foreground">{children}</p>;
}

export function DemoBanner() {
  const { dataset } = useDataset();
  if (dataset?.source !== "demo") return null;
  return (
    <div className="mb-6 flex items-center gap-2 rounded-lg border border-warning bg-warning-soft px-4 py-2.5 text-xs text-warning-foreground">
      <FlaskConical className="h-4 w-4 shrink-0" />
      You are viewing <strong>synthetic demo data</strong>. Figures illustrate the interface only and are not real campaign results.
    </div>
  );
}

export function EmptyState() {
  const { setUploadOpen, setDataset } = useDataset();
  return (
    <div className="card-surface mx-auto flex max-w-xl flex-col items-center px-8 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <DatabaseZap className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-xl font-bold">No dataset loaded</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Upload a bank marketing CSV to compute metrics. Nothing is shown until real data is available — no placeholder figures.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={() => setUploadOpen(true)}><Upload className="h-4 w-4" /> Upload CSV</Button>
        <Button variant="outline" onClick={() => setDataset(makeDemoDataset())}>
          <FlaskConical className="h-4 w-4" /> Load demo data (synthetic)
        </Button>
      </div>
    </div>
  );
}

export function Unsupported({ field }: { field: string }) {
  return <p className="py-8 text-center text-xs text-muted-foreground">Column “{field}” not present in this dataset.</p>;
}

function RateTooltip({ active, payload }: { active?: boolean; payload?: { payload: Group }[] }) {
  if (!active || !payload?.length) return null;
  const g = payload[0]!.payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-semibold">{g.key}</div>
      <div className="mt-1 tabular-nums">Rate: <strong>{g.rate.toFixed(1)}%</strong></div>
      <div className="tabular-nums text-muted-foreground">{g.yes.toLocaleString()} subscribed / {g.total.toLocaleString()} records</div>
    </div>
  );
}

export function RateChart({ data, height = 260, horizontal, baseline }: { data: Group[]; height?: number; horizontal?: boolean; baseline?: number }) {
  return (
    <ResponsiveContainer width="100%" height={horizontal ? Math.max(height, data.length * 30 + 20) : height}>
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ left: horizontal ? 10 : 0, right: 12, top: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={!!horizontal} horizontal={!horizontal} />
        {horizontal
          ? [
              <XAxis key="x" type="number" unit="%" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />,
              <YAxis key="y" type="category" dataKey="key" width={100} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />,
            ]
          : [
              <XAxis key="x" dataKey="key" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />,
              <YAxis key="y" unit="%" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />,
            ]}
        <Tooltip content={<RateTooltip />} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="rate" radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={36}>
          {data.map((g) => (
            <Cell key={g.key} fill={baseline != null && g.rate >= baseline ? "var(--chart-1)" : "var(--chart-2)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Legend({ baseline }: { baseline: number }) {
  return (
    <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-chart-1" /> ≥ baseline ({baseline.toFixed(1)}%)</span>
      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-chart-2" /> below</span>
    </div>
  );
}
