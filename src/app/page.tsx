import { Plus } from "lucide-react";
import { FilterBar } from "@/components/filter-bar";
import { ProspectTable } from "@/components/prospect-table";
import { StatCards } from "@/components/stat-cards";
import { LinkButton, PageHeader } from "@/components/ui";
import { getFilterOptions, getStats, listProspects } from "@/lib/db";
import { hasDatabase } from "@/lib/config";
import { LocalCrmApp } from "@/components/local-crm-app";

export default async function Dashboard({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (!hasDatabase()) return <LocalCrmApp initialView="dashboard" />;

  const params = await searchParams;
  const [stats, prospects, options] = await Promise.all([getStats(), listProspects(params), getFilterOptions()]);

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
