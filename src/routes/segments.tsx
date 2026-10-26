import { createFileRoute } from "@tanstack/react-router";
import { useDataset } from "@/lib/dataset-store";
import { ageGroups, byColumn, kpis, SEGMENT_FIELDS } from "@/lib/analytics";
import { Card, DemoBanner, EmptyState, Legend, PageIntro, RateChart } from "@/components/app/ui";

export const Route = createFileRoute("/segments")({
  head: () => ({
    meta: [
      { title: "Customer Segmentation — CampaignLens" },
      { name: "description", content: "Response rates across age, occupation, education and marital status." },
      { property: "og:title", content: "Customer Segmentation — CampaignLens" },
      { property: "og:description", content: "Compare subscription response across customer segments." },
    ],
  }),
  component: Segments,
});

function Segments() {
  const { dataset } = useDataset();
  if (!dataset) return <EmptyState />;
  const base = kpis(dataset).rate;
  const age = ageGroups(dataset);
  const fields = SEGMENT_FIELDS.map((f) => ({ ...f, data: byColumn(dataset, f.key) })).filter((f) => f.data);
  const hidden = SEGMENT_FIELDS.length - fields.length + (age ? 0 : 1);

  return (
    <div className="mx-auto max-w-7xl">
      <DemoBanner />
      <PageIntro>
        Response rate per customer segment. Segments with small counts can be volatile — check the record count in each tooltip.
        {hidden > 0 && ` ${hidden} dimension(s) hidden because the columns are absent.`}
      </PageIntro>
      <div className="grid gap-4 lg:grid-cols-2">
        {age && (
          <Card title="Age group" action={<Legend baseline={base} />} className="lg:col-span-2">
            <RateChart data={age} baseline={base} />
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
