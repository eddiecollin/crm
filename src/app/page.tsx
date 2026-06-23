import { Plus } from "lucide-react";
import { FilterBar } from "@/components/filter-bar";
import { ProspectTable } from "@/components/prospect-table";
import { StatCards } from "@/components/stat-cards";
import { LinkButton, PageHeader } from "@/components/ui";
import { getFilterOptions, getStats, listProspects } from "@/lib/db";
import { hasDatabase } from "@/lib/config";
import { LocalCrmApp } from "@/components/local-crm-app";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (!hasDatabase()) return <LocalCrmApp initialView="dashboard" />;

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const params = await searchParams;
  const [stats, prospects, options] = await Promise.all([getStats(user.id), listProspects(params, user.id), getFilterOptions(user.id)]);

  return (
    <>
      <PageHeader
        eyebrow="Sales pipeline"
        title="Website demo outreach"
        action={
          <LinkButton href="/prospects/new">
            <Plus size={16} />
            Add prospect
          </LinkButton>
        }
      />
      <StatCards stats={stats} />
      <div className="mt-6">
        <FilterBar cities={options.cities} trades={options.trades} defaults={params} />
        <ProspectTable prospects={prospects} />
      </div>
    </>
  );
}
