import { createFileRoute } from "@tanstack/react-router";
import { useDataset } from "@/lib/dataset-store";
import { byColumn, campaignGroups, kpis, monthGroups, CAMPAIGN_FIELDS } from "@/lib/analytics";
import { Card, DemoBanner, EmptyState, Legend, PageIntro, RateChart } from "@/components/app/ui";

export const Route = createFileRoute("/campaigns")({
  head: () => ({
    meta: [
      { title: "Campaign Analysis — CampaignLens" },
      { name: "description", content: "Compare subscription rates by campaign attributes and contact frequency." },
      { property: "og:title", content: "Campaign Analysis — CampaignLens" },
      { property: "og:description", content: "Subscription rates by contact channel, month, prior outcome and call frequency." },
    ],
  }),
  component: Campaigns,
});

function Campaigns() {
  const { dataset } = useDataset();
  if (!dataset) return <EmptyState />;
  const base = kpis(dataset).rate;
  const freq = campaignGroups(dataset);
  const months = monthGroups(dataset);
  const fields = CAMPAIGN_FIELDS.map((f) => ({ ...f, data: byColumn(dataset, f.key) })).filter((f) => f.data);

  return (
    <div className="mx-auto max-w-7xl">
      <DemoBanner />
      <PageIntro>How subscription rates vary with campaign attributes. Tooltips show subscribed / total records for each bar.</PageIntro>
      <div className="grid gap-4 lg:grid-cols-2">
        {freq && (
          <Card title="Contact frequency" subtitle="Number of contacts during this campaign" action={<Legend baseline={base} />} className="lg:col-span-2">
            <RateChart data={freq} baseline={base} />
          </Card>
        )}
        {months && months.length > 0 && (
          <Card title="Month of last contact" action={<Legend baseline={base} />} className="lg:col-span-2">
            <RateChart data={months} baseline={base} />
          </Card>
        )}
        {fields.map((f) => (
          <Card key={f.key} title={f.label}>
            <RateChart data={f.data!} baseline={base} horizontal height={200} />
          </Card>
        ))}
      </div>
    </div>
  );
}
