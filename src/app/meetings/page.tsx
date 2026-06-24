import { ProspectTable } from "@/components/prospect-table";
import { PageHeader } from "@/components/ui";
import { hasDatabase } from "@/lib/config";
import { listProspects } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { LocalCrmApp } from "@/components/local-crm-app";
import { redirect } from "next/navigation";

const closerStatuses = new Set(["Handed to closer", "Meeting booked", "Meeting completed", "Proposal sent", "Won"]);

export default async function MeetingsPage() {
  if (!hasDatabase()) return <LocalCrmApp initialView="prospects" />;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const prospects = (await listProspects({ sort: "meetingDate" }, user.id)).filter((prospect) =>
    closerStatuses.has(prospect.status)
  );

  return (
    <>
      <PageHeader eyebrow="Closer workspace" title="Teams meetings and closing pipeline" />
      <ProspectTable prospects={prospects} emptyLabel="No leads handed to the closer yet." />
    </>
  );
}
