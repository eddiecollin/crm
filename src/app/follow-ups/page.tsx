import { ProspectTable } from "@/components/prospect-table";
import { PageHeader } from "@/components/ui";
import { listProspects } from "@/lib/db";
import { hasDatabase } from "@/lib/config";
import { LocalCrmApp } from "@/components/local-crm-app";

export default async function FollowUpsPage() {
  if (!hasDatabase()) return <LocalCrmApp initialView="followups" />;

  const prospects = await listProspects({ due: "today", sort: "nextFollowUp" });

  return (
    <>
      <PageHeader eyebrow="Today" title="Needs follow-up" />
      <ProspectTable prospects={prospects} emptyLabel="No follow-ups due today." />
    </>
  );
}
