import { createProspectAction } from "@/app/actions";
import { ProspectForm } from "@/components/prospect-form";
import { PageHeader } from "@/components/ui";

export default function NewProspectPage() {
  return (
    <>
      <PageHeader eyebrow="New lead" title="Add prospect" />
      <ProspectForm action={createProspectAction} />
    </>
  );
}
