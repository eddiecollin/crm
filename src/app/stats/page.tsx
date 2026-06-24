import { Card, PageHeader } from "@/components/ui";
import { getStats } from "@/lib/db";
import { hasDatabase } from "@/lib/config";
import { LocalCrmApp } from "@/components/local-crm-app";
import { percent } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StatsPage() {
  if (!hasDatabase()) return <LocalCrmApp initialView="stats" />;

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const stats = await getStats(user.id);
  const rates = [
    { label: "Demo sent to reply", value: stats.demoToReplyRate },
    { label: "Reply to meeting booked", value: stats.replyToMeetingRate },
    { label: "Meeting completed to won", value: stats.meetingToWonRate }
  ];

  return (
    <>
      <PageHeader eyebrow="Performance" title="Outreach stats" />
      <div className="grid gap-4 md:grid-cols-3">
        {rates.map((rate) => (
          <Card key={rate.label} className="p-5">
            <div className="text-sm font-medium text-slate-500">{rate.label}</div>
            <div className="mt-3 text-4xl font-semibold text-ink">{percent(rate.value)}</div>
            <div className="mt-4 h-2 rounded-full bg-field">
              <div className="h-2 rounded-full bg-pine" style={{ width: `${Math.min(rate.value, 100)}%` }} />
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-5 overflow-hidden">
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-line">
            <StatRow label="Total prospects" value={stats.totalProspects} />
            <StatRow label="Demos sent" value={stats.demosSent} />
            <StatRow label="Replies" value={stats.replies} />
            <StatRow label="Interested leads" value={stats.interestedLeads} />
            <StatRow label="Handed to closer" value={stats.handoffsToCloser} />
            <StatRow label="Meetings booked" value={stats.meetingsBooked} />
            <StatRow label="Meetings completed" value={stats.meetingsCompleted} />
            <StatRow label="Proposals sent" value={stats.proposalsSent} />
            <StatRow label="Won clients" value={stats.wonClients} />
            <StatRow label="Follow-ups due today" value={stats.followUpsDueToday} />
          </tbody>
        </table>
      </Card>
    </>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <tr>
      <th className="px-5 py-4 font-medium text-slate-600">{label}</th>
      <td className="px-5 py-4 text-right text-lg font-semibold text-ink">{value}</td>
    </tr>
  );
}
