import { ExternalLink, Pencil, Plus } from "lucide-react";
import type { Prospect } from "@/lib/types";
import { formatDate, statusTone } from "@/lib/utils";
import { Card, LinkButton } from "./ui";
import { QuickActions } from "./quick-actions";

export function ProspectTable({ prospects, emptyLabel = "No prospects yet." }: { prospects: Prospect[]; emptyLabel?: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="text-sm font-semibold text-ink">Companies</div>
        <LinkButton href="/prospects/new" variant="secondary" className="h-9">
          <Plus size={16} />
          Add lead
        </LinkButton>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1500px] w-full border-collapse text-left text-sm">
          <thead className="bg-field text-xs uppercase tracking-[0.08em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Company</th>
              <th className="px-4 py-3 font-semibold">Trade</th>
              <th className="px-4 py-3 font-semibold">City</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Website</th>
              <th className="px-4 py-3 font-semibold">Demo</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Last contacted</th>
              <th className="px-4 py-3 font-semibold">Next follow-up</th>
              <th className="px-4 py-3 font-semibold">Notes</th>
              <th className="px-4 py-3 font-semibold">Quick actions</th>
              <th className="px-4 py-3 font-semibold">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {prospects.map((prospect) => (
              <tr key={prospect.id} className="align-top hover:bg-field/60">
                <td className="px-4 py-3">
                  <a href={`/prospects/${prospect.id}`} className="font-semibold text-ink hover:text-pine">
                    {prospect.companyName}
                  </a>
                </td>
                <td className="px-4 py-3 text-slate-600">{prospect.trade}</td>
                <td className="px-4 py-3 text-slate-600">{prospect.city}</td>
                <td className="px-4 py-3 text-slate-600">{prospect.contactPerson}</td>
                <td className="px-4 py-3 text-slate-600">{prospect.phone}</td>
                <td className="px-4 py-3 text-slate-600">{prospect.email}</td>
                <td className="px-4 py-3">
                  {prospect.websiteUrl ? (
                    <a className="inline-flex items-center gap-1 text-pine" href={prospect.websiteUrl} target="_blank">
                      Site <ExternalLink size={13} />
                    </a>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  {prospect.demoUrl ? (
                    <a className="inline-flex items-center gap-1 text-pine" href={prospect.demoUrl} target="_blank">
                      Demo <ExternalLink size={13} />
                    </a>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusTone(prospect.status)}`}>
                    {prospect.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(prospect.lastContactedDate)}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(prospect.nextFollowUpDate)}</td>
                <td className="max-w-[260px] px-4 py-3 text-slate-600">
                  <span className="line-clamp-2">{prospect.notes}</span>
                </td>
                <td className="px-4 py-3">
                  <QuickActions prospectId={prospect.id} compact />
                </td>
                <td className="px-4 py-3">
                  <a className="inline-flex size-8 items-center justify-center rounded-md hover:bg-white" href={`/prospects/${prospect.id}/edit`}>
                    <Pencil size={15} />
                  </a>
                </td>
              </tr>
            ))}
            {prospects.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-slate-500" colSpan={14}>
                  {emptyLabel}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
