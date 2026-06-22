import { CalendarClock, Handshake, MailCheck, MousePointer2, Reply, UsersRound } from "lucide-react";
import type { Stats } from "@/lib/types";
import { Card } from "./ui";

const statsConfig = [
  { key: "totalProspects", label: "Total prospects", icon: UsersRound },
  { key: "demosSent", label: "Demos sent", icon: MousePointer2 },
  { key: "replies", label: "Replies", icon: Reply },
  { key: "interestedLeads", label: "Interested leads", icon: MailCheck },
  { key: "wonClients", label: "Won clients", icon: Handshake },
  { key: "followUpsDueToday", label: "Due today", icon: CalendarClock }
] as const;

export function StatCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {statsConfig.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.key} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="grid size-9 place-items-center rounded-md bg-field text-pine">
                <Icon size={18} />
              </div>
            </div>
            <div className="mt-4 text-2xl font-semibold text-ink">{stats[item.key]}</div>
            <div className="text-sm text-slate-500">{item.label}</div>
          </Card>
        );
      })}
    </div>
  );
}
