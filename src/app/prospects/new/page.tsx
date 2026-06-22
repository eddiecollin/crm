import { createProspectAction } from "@/app/actions";
import { ProspectForm } from "@/components/prospect-form";
import { PageHeader } from "@/components/ui";
import { hasDatabase } from "@/lib/config";
import { LocalCrmApp } from "@/components/local-crm-app";

export default function NewProspectPage() {
  if (!hasDatabase()) return <LocalCrmApp initialView="new" />;

  return (
    <>
      <PageHeader eyebrow="New lead" title="Add prospect" />
      <ProspectForm action={createProspectAction} />
    </>
  );
}
