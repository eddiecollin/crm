import { Plus } from "lucide-react";
import { FilterBar } from "@/components/filter-bar";
import { ProspectTable } from "@/components/prospect-table";
import { LinkButton, PageHeader } from "@/components/ui";
import { getFilterOptions, listProspects } from "@/lib/db";
import { hasDatabase } from "@/lib/config";
import { LocalCrmApp } from "@/components/local-crm-app";

export default async function ProspectsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (!hasDatabase()) return <LocalCrmApp initialView="prospects" />;

  const params = await searchParams;
  const [prospects, options] = await Promise.all([listProspects(params), getFilterOptions()]);

  return (
    <>
      <PageHeader
        eyebrow="Prospects"
        title="All companies"
        action={
          <LinkButton href="/prospects/new">
            <Plus size={16} />
            Add prospect
          </LinkButton>
        }
      />
      <FilterBar cities={options.cities} trades={options.trades} defaults={params} />
      <ProspectTable prospects={prospects} />
    </>
  );
}
