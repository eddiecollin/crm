import { Save } from "lucide-react";
import { STATUSES, type Prospect } from "@/lib/types";
import { Button, Card, Field, inputClass, textareaClass } from "./ui";

export function ProspectForm({
  action,
  prospect
}: {
  action: (formData: FormData) => void | Promise<void>;
  prospect?: Prospect;
}) {
  return (
    <form action={action}>
      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Company name">
            <input required name="companyName" defaultValue={prospect?.companyName} className={inputClass} />
          </Field>
          <Field label="Trade/niche">
            <input required name="trade" defaultValue={prospect?.trade} className={inputClass} />
          </Field>
          <Field label="City">
            <input required name="city" defaultValue={prospect?.city} className={inputClass} />
          </Field>
          <Field label="Contact person">
            <input name="contactPerson" defaultValue={prospect?.contactPerson} className={inputClass} />
          </Field>
          <Field label="Phone">
            <input name="phone" defaultValue={prospect?.phone} className={inputClass} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" defaultValue={prospect?.email} className={inputClass} />
          </Field>
          <Field label="Current website URL">
            <input name="websiteUrl" type="url" defaultValue={prospect?.websiteUrl} className={inputClass} />
          </Field>
          <Field label="Demo URL">
            <input name="demoUrl" type="url" defaultValue={prospect?.demoUrl} className={inputClass} />
          </Field>
          <Field label="Source">
            <input name="source" defaultValue={prospect?.source} className={inputClass} />
          </Field>
          <Field label="Cold caller">
            <input name="coldCaller" defaultValue={prospect?.coldCaller} className={inputClass} placeholder="Who found this lead?" />
          </Field>
          <Field label="Closer">
            <input name="closer" defaultValue={prospect?.closer} className={inputClass} placeholder="Who takes the meeting?" />
          </Field>
          <Field label="Status">
            <select name="status" defaultValue={prospect?.status ?? "New lead"} className={inputClass}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </Field>
          {prospect ? (
            <Field label="Last contacted date">
              <input name="lastContactedDate" type="date" defaultValue={prospect.lastContactedDate} className={inputClass} />
            </Field>
          ) : null}
          <Field label="Next follow-up date">
            <input name="nextFollowUpDate" type="date" defaultValue={prospect?.nextFollowUpDate} className={inputClass} />
          </Field>
          <Field label="Teams meeting date">
            <input name="meetingDate" type="date" defaultValue={prospect?.meetingDate} className={inputClass} />
          </Field>
          <Field label="Teams meeting link">
            <input name="meetingUrl" type="url" defaultValue={prospect?.meetingUrl} className={inputClass} />
          </Field>
          <Field label="Deal value">
            <input name="dealValue" defaultValue={prospect?.dealValue} className={inputClass} placeholder="Example: 1500 EUR" />
          </Field>
          <div className="md:col-span-2 xl:col-span-3">
            <Field label="Meeting outcome / closer notes">
              <textarea name="meetingOutcome" defaultValue={prospect?.meetingOutcome} className={textareaClass} />
            </Field>
          </div>
          <div className="md:col-span-2 xl:col-span-3">
            <Field label="Notes">
              <textarea name="notes" defaultValue={prospect?.notes} className={textareaClass} />
            </Field>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button>
            <Save size={16} />
            Save prospect
          </Button>
        </div>
      </Card>
    </form>
  );
}
