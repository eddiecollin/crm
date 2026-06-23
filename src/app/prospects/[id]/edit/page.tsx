import { notFound } from "next/navigation";
import { updateProspectAction } from "@/app/actions";
import { ProspectForm } from "@/components/prospect-form";
import { PageHeader } from "@/components/ui";
import { getProspect } from "@/lib/db";
import { hasDatabase } from "@/lib/config";
import { LocalCrmApp } from "@/components/local-crm-app";
import { getCurrentUser } from "@/lib/auth";

export default async function EditProspectPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasDatabase()) return <LocalCrmApp initialView="prospects" />;

  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();
  const prospect = await getProspect(id, user.id);
  if (!prospect) notFound();

  return (
    <>
      <PageHeader eyebrow="Edit prospect" title={prospect.companyName} />
      <ProspectForm prospect={prospect} action={updateProspectAction.bind(null, id)} />
    </>
  );
}
