import { ProspectTable } from "@/components/prospect-table";
import { PageHeader } from "@/components/ui";
import { listProspects } from "@/lib/db";
import { hasDatabase } from "@/lib/config";
import { LocalCrmApp } from "@/components/local-crm-app";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function FollowUpsPage() {
  if (!hasDatabase()) return <LocalCrmApp initialView="followups" />;

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const prospects = await listProspects({ due: "today", sort: "nextFollowUp" }, user.id);

  return (
    <>
      <PageHeader eyebrow="Today" title="Needs follow-up" />
      <ProspectTable prospects={prospects} emptyLabel="No follow-ups due today." />
    </>
  );
}
