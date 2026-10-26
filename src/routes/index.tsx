import { createFileRoute } from "@tanstack/react-router";
import { Users, CheckCircle2, Percent, PhoneCall } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useDataset } from "@/lib/dataset-store";
import { byColumn, kpis, monthGroups, findTarget } from "@/lib/analytics";
import { Card, DemoBanner, EmptyState, Kpi, Legend, RateChart, Unsupported } from "@/components/app/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — CampaignLens Bank Marketing Analytics" },
      { name: "description", content: "Key subscription metrics, monthly response rates and contact method comparison." },
      { property: "og:title", content: "Overview — CampaignLens" },
      { property: "og:description", content: "Bank marketing campaign KPIs computed from your data." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { dataset } = useDataset();
  if (!dataset) return <EmptyState />;
  const k = kpis(dataset);
  const months = monthGroups(dataset);
  const contact = byColumn(dataset, "contact");
  const pie = [
    { name: "Subscribed", value: k.yes, fill: "var(--color-chart-1)" },
    { name: "Not subscribed", value: k.total - k.yes, fill: "var(--color-chart-4)" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <DemoBanner />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total records" value={k.total.toLocaleString()} hint="Customers contacted" icon={<Users className="h-4 w-4" />} />
        <Kpi label="Subscriptions" value={k.yes.toLocaleString()} hint="Outcome = yes" icon={<CheckCircle2 className="h-4 w-4" />} />
        <Kpi label="Subscription rate" value={`${k.rate.toFixed(1)}%`} hint={`${k.yes} / ${k.total}`} icon={<Percent className="h-4 w-4" />} />
        <Kpi label="Avg. contacts" value={k.avgContacts != null ? k.avgContacts.toFixed(2) : "—"} hint={k.avgContacts != null ? "Calls per customer this campaign" : "No 'campaign' column"} icon={<PhoneCall className="h-4 w-4" />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Subscription outcome" subtitle="Share of all records">
          <div className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pie} dataKey="value" innerRadius={62} outerRadius={90} paddingAngle={2} stroke="none">
                  {pie.map((p) => <Cell key={p.name} fill={p.fill} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v.toLocaleString()} (${((v / k.total) * 100).toFixed(1)}%)`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-bold">{k.rate.toFixed(1)}%</span>
              <span className="text-[11px] text-muted-foreground">subscribed</span>
            </div>
          </div>
          <div className="mt-2 flex justify-center gap-4 text-xs">
            {pie.map((p) => (
              <span key={p.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm" style={{ background: p.fill }} /> {p.name}
              </span>
            ))}
          </div>
        </Card>
        <Card title="Response rate by month" subtitle="Hover for record counts" className="lg:col-span-2" action={<Legend baseline={k.rate} />}>
          {months?.length ? <RateChart data={months} baseline={k.rate} /> : <Unsupported field="month" />}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Contact method comparison" subtitle="Subscription rate by channel">
          {contact ? <RateChart data={contact} baseline={k.rate} height={220} /> : <Unsupported field="contact" />}
        </Card>
        <Card title="Dataset summary">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Item k="Source" v={dataset.source === "demo" ? "Synthetic demo" : "Uploaded CSV"} />
            <Item k="File" v={dataset.name} />
            <Item k="Rows" v={dataset.rows.length.toLocaleString()} />
            <Item k="Columns" v={String(dataset.columns.length)} />
            <Item k="Outcome column" v={findTarget(dataset.columns) ?? "—"} />
            <Item k="Loaded" v={new Date(dataset.loadedAt).toLocaleString()} />
          </dl>
          {dataset.warnings.length > 0 && (
            <ul className="mt-4 space-y-1 border-t pt-3 text-xs text-warning-foreground">
              {dataset.warnings.map((w) => <li key={w}>⚠ {w}</li>)}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{k}</dt>
      <dd className="truncate font-medium">{v}</dd>
    </div>
  );
}
