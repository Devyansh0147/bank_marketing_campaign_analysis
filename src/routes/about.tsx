import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/app/ui";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Project — CampaignLens" },
      { name: "description", content: "About the Bank Marketing Campaign Analytics Platform major project." },
      { property: "og:title", content: "About — CampaignLens" },
      { property: "og:description", content: "Goals, data format and architecture of the platform." },
    ],
  }),
  component: About,
});

const COLS = ["age", "job", "marital", "education", "default", "balance", "housing", "loan", "contact", "month", "campaign", "previous", "poutcome", "y"];

function About() {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Card title="Bank Marketing Campaign Analytics Platform">
        <p className="text-sm leading-relaxed text-muted-foreground">
          A college major project that helps bank marketing teams study historical direct-marketing campaigns and the
          factors associated with customers subscribing to a term deposit. All figures are computed from the dataset you load.
        </p>
      </Card>
      <Card title="Expected data format" subtitle="Compatible with the UCI Bank Marketing dataset (comma or semicolon separated)">
        <div className="flex flex-wrap gap-1.5">
          {COLS.map((c) => <span key={c} className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{c}</span>)}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Only an outcome column (y / deposit) is required. Views for missing columns are hidden.</p>
      </Card>
      <Card title="Current architecture">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>Frontend-only: CSV parsing, validation and all aggregations run in the browser.</li>
          <li>Data is held in memory and cleared on page refresh — nothing is uploaded or stored.</li>
          <li>Future backend options: saved datasets, user accounts, larger files, and predictive models.</li>
        </ul>
      </Card>
    </div>
  );
}
