import { createProspectAction } from "@/app/actions";
import { ProspectForm } from "@/components/prospect-form";
import { PageHeader } from "@/components/ui";
import { hasDatabase } from "@/lib/config";
import { LocalCrmApp } from "@/components/local-crm-app";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewProspectPage() {
  if (!hasDatabase()) return <LocalCrmApp initialView="new" />;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <PageHeader eyebrow="New lead" title="Add prospect" />
      <ProspectForm action={createProspectAction} />
    </>
  );
}
