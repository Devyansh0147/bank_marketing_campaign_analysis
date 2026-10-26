import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { useDataset } from "@/lib/dataset-store";
import { insights } from "@/lib/analytics";
import { DemoBanner, EmptyState, PageIntro } from "@/components/app/ui";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights & Recommendations — CampaignLens" },
      { name: "description", content: "Evidence-based observations computed from the loaded campaign data." },
      { property: "og:title", content: "Insights & Recommendations — CampaignLens" },
      { property: "og:description", content: "Data-driven observations with figures and caveats." },
    ],
  }),
  component: Insights,
});

function Insights() {
  const { dataset } = useDataset();
  if (!dataset) return <EmptyState />;
  const list = insights(dataset);
  return (
    <div className="mx-auto max-w-5xl">
      <DemoBanner />
      <PageIntro>
        Observations are generated automatically from the loaded data. They describe associations, not causes — use them to decide what to test next (e.g. A/B experiments), not as proof.
      </PageIntro>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((i) => (
          <article key={i.title} className="card-surface flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold">{i.title}</h2>
              </div>
              <span className="font-display text-lg font-bold tabular-nums text-primary">{i.figure}</span>
            </div>
            <p className="mt-3 flex-1 text-sm">{i.detail}</p>
            <p className="mt-4 flex gap-2 border-t pt-3 text-xs text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {i.caveat}
            </p>
          </article>
        ))}
      </div>
      {list.length <= 1 && (
        <p className="mt-6 text-sm text-muted-foreground">Not enough supported columns or records to produce further comparisons.</p>
      )}
    </div>
  );
}
