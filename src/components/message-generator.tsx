"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import type { Prospect, Template } from "@/lib/types";
import { personalizeTemplate } from "@/lib/utils";
import { Button, Card, Field, inputClass, textareaClass } from "./ui";

export function MessageGenerator({
  prospect,
  templates,
  myName
}: {
  prospect: Prospect;
  templates: Template[];
  myName: string;
}) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const selected = templates.find((template) => template.id === templateId) ?? templates[0];
  const message = useMemo(
    () => (selected ? personalizeTemplate(selected, prospect, myName) : ""),
    [selected, prospect, myName]
  );

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Generated message</h2>
          <p className="text-sm text-slate-500">Choose a template and copy the personalized version.</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigator.clipboard.writeText(message)}
          disabled={!message}
          title="Copy generated message"
        >
          <Copy size={16} />
          Copy
        </Button>
      </div>
      <div className="grid gap-4">
        <Field label="Template">
          <select className={inputClass} value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Message">
          <textarea readOnly value={message} className={`${textareaClass} min-h-64 bg-field`} />
        </Field>
      </div>
    </Card>
  );
}
