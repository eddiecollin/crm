import { saveTemplateAction } from "@/app/actions";
import { Card, Field, PageHeader, Button, inputClass, textareaClass } from "@/components/ui";
import { listTemplates } from "@/lib/db";
import { hasDatabase } from "@/lib/config";
import { LocalCrmApp } from "@/components/local-crm-app";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TemplatesPage() {
  if (!hasDatabase()) return <LocalCrmApp initialView="templates" />;

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const templates = await listTemplates(user.id);

  return (
    <>
      <PageHeader eyebrow="Reusable messages" title="Templates" />
      <div className="grid gap-4 xl:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id} className="p-5">
            <form action={saveTemplateAction} className="grid gap-4">
              <input type="hidden" name="id" value={template.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Template name">
                  <input name="name" defaultValue={template.name} className={inputClass} />
                </Field>
                <Field label="Type">
                  <input name="type" defaultValue={template.type} className={inputClass} />
                </Field>
              </div>
              <Field label="Message body">
                <textarea name="body" defaultValue={template.body} className={`${textareaClass} min-h-56`} />
              </Field>
              <div className="text-xs text-slate-500">
                Placeholders: {"{company}"}, {"{trade}"}, {"{city}"}, {"{demoUrl}"}, {"{myName}"}
              </div>
              <div className="flex justify-end">
                <Button>Save template</Button>
              </div>
            </form>
          </Card>
        ))}
        <Card className="p-5">
          <form action={saveTemplateAction} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Template name">
                <input name="name" className={inputClass} placeholder="New template" />
              </Field>
              <Field label="Type">
                <input name="type" className={inputClass} placeholder="Follow-up" />
              </Field>
            </div>
            <Field label="Message body">
              <textarea name="body" className={`${textareaClass} min-h-56`} />
            </Field>
            <div className="flex justify-end">
              <Button>Add template</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
