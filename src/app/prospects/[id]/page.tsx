import { notFound } from "next/navigation";
import { addTimelineAction } from "@/app/actions";
import { MessageGenerator } from "@/components/message-generator";
import { QuickActions } from "@/components/quick-actions";
import { Button, Card, Field, LinkButton, PageHeader, inputClass, textareaClass } from "@/components/ui";
import { getProspect, listTemplates, listTimeline } from "@/lib/db";
import { hasDatabase } from "@/lib/config";
import { formatDate, statusTone, todayIso } from "@/lib/utils";
import { LocalCrmApp } from "@/components/local-crm-app";
import { getCurrentUser } from "@/lib/auth";

export default async function ProspectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasDatabase()) return <LocalCrmApp initialView="prospects" />;

  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();
  const [prospect, templates, timeline] = await Promise.all([getProspect(id, user.id), listTemplates(user.id), listTimeline(id, user.id)]);
  if (!prospect) notFound();

  return (
    <>
      <PageHeader
        eyebrow={prospect.trade}
        title={prospect.companyName}
        action={
          <div className="flex gap-2">
            <LinkButton href={`/prospects/${id}/edit`} variant="secondary">
              Edit
            </LinkButton>
            <LinkButton href="/prospects" variant="ghost">
              All prospects
            </LinkButton>
          </div>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <div className="grid gap-5">
          <Card className="p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-slate-500">{prospect.city}</div>
                <div className="mt-1 text-lg font-semibold text-ink">{prospect.contactPerson || "No contact person"}</div>
              </div>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(prospect.status)}`}>
                {prospect.status}
              </span>
            </div>
            <Info label="Phone" value={prospect.phone} />
            <Info label="Email" value={prospect.email} />
            <Info label="Website" value={prospect.websiteUrl} href={prospect.websiteUrl} />
            <Info label="Demo" value={prospect.demoUrl} href={prospect.demoUrl} />
            <Info label="Source" value={prospect.source} />
            <Info label="Cold caller" value={prospect.coldCaller} />
            <Info label="Closer" value={prospect.closer} />
            <Info label="Last contacted" value={formatDate(prospect.lastContactedDate)} />
            <Info label="Next follow-up" value={formatDate(prospect.nextFollowUpDate)} />
            <Info label="Meeting date" value={formatDate(prospect.meetingDate)} />
            <Info label="Teams link" value={prospect.meetingUrl} href={prospect.meetingUrl} />
            <Info label="Deal value" value={prospect.dealValue} />
            <div className="mt-5">
              <div className="mb-2 text-sm font-semibold text-ink">Quick actions</div>
              <QuickActions prospectId={id} />
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-ink">Notes</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{prospect.notes || "No notes yet."}</p>
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-ink">Closer notes</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {prospect.meetingOutcome || "No meeting outcome recorded yet."}
            </p>
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 text-lg font-semibold text-ink">Add timeline entry</h2>
            <form action={addTimelineAction.bind(null, id)} className="grid gap-4">
              <Field label="Date">
                <input name="entryDate" type="date" defaultValue={todayIso()} className={inputClass} />
              </Field>
              <Field label="Action type">
                <input name="actionType" placeholder="Call, email, reply, note" className={inputClass} />
              </Field>
              <Field label="Message sent">
                <textarea name="messageSent" className={textareaClass} />
              </Field>
              <Field label="Notes">
                <textarea name="notes" className={textareaClass} />
              </Field>
              <div className="flex justify-end">
                <Button>Add entry</Button>
              </div>
            </form>
          </Card>
        </div>
        <div className="grid gap-5">
          <MessageGenerator prospect={prospect} templates={templates} myName={process.env.MY_NAME ?? "Your Name"} />
          <Card className="overflow-hidden">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-lg font-semibold text-ink">Communication history</h2>
            </div>
            <div className="divide-y divide-line">
              {timeline.map((entry) => (
                <div key={entry.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold text-ink">{entry.actionType}</div>
                    <div className="text-sm text-slate-500">{formatDate(entry.entryDate)}</div>
                  </div>
                  {entry.messageSent ? (
                    <pre className="mt-3 whitespace-pre-wrap rounded-md bg-field p-3 text-sm leading-6 text-slate-700">{entry.messageSent}</pre>
                  ) : null}
                  {entry.notes ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{entry.notes}</p> : null}
                </div>
              ))}
              {timeline.length === 0 ? <div className="px-5 py-10 text-center text-slate-500">No timeline entries yet.</div> : null}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Info({ label, value, href }: { label: string; value?: string; href?: string }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 border-t border-line py-3 text-sm">
      <div className="font-medium text-slate-500">{label}</div>
      <div className="min-w-0 text-ink">
        {href && value ? (
          <a className="break-words text-pine hover:underline" href={href} target="_blank">
            {value}
          </a>
        ) : (
          value || ""
        )}
      </div>
    </div>
  );
}
