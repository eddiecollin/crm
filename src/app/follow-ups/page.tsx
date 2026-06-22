import { ProspectTable } from "@/components/prospect-table";
import { PageHeader } from "@/components/ui";
import { listProspects } from "@/lib/db";

export default async function FollowUpsPage() {
  const prospects = await listProspects({ due: "today", sort: "nextFollowUp" });

  return (
    <>
      <PageHeader eyebrow="Today" title="Needs follow-up" />
      <ProspectTable prospects={prospects} emptyLabel="No follow-ups due today." />
    </>
  );
}
