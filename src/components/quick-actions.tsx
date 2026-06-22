"use client";

import type { ElementType } from "react";
import { Check, Flag, MailCheck, Reply, Send, X } from "lucide-react";
import { quickStatusAction } from "@/app/actions";
import type { ProspectStatus } from "@/lib/types";
import { Button } from "./ui";

const actions: { label: string; status: ProspectStatus; icon: ElementType; variant?: "primary" | "secondary" | "danger" }[] = [
  { label: "Demo sent", status: "Demo sent", icon: Send },
  { label: "Follow-up 1", status: "Follow-up 1 sent", icon: MailCheck, variant: "secondary" },
  { label: "Follow-up 2", status: "Follow-up 2 sent", icon: MailCheck, variant: "secondary" },
  { label: "Replied", status: "Replied", icon: Reply, variant: "secondary" },
  { label: "Won", status: "Won", icon: Check, variant: "secondary" },
  { label: "Lost", status: "Lost", icon: X, variant: "danger" }
];

export function QuickActions({ prospectId, compact = false }: { prospectId: string; compact?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <form key={action.status} action={quickStatusAction.bind(null, prospectId, action.status)}>
            <Button
              title={`Mark ${action.label}`}
              variant={action.variant ?? "primary"}
              className={compact ? "h-8 px-2 text-xs" : ""}
            >
              {action.status === "Lost" ? <Flag size={compact ? 14 : 16} /> : <Icon size={compact ? 14 : 16} />}
              {compact ? null : action.label}
            </Button>
          </form>
        );
      })}
    </div>
  );
}
