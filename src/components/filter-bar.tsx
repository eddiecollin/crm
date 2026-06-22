import { SlidersHorizontal } from "lucide-react";
import { STATUSES } from "@/lib/types";
import { Button, Card, inputClass } from "./ui";

export function FilterBar({
  cities,
  trades,
  defaults = {}
}: {
  cities: string[];
  trades: string[];
  defaults?: Record<string, string | undefined>;
}) {
  return (
    <Card className="mb-4 p-3">
      <form className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <select name="status" defaultValue={defaults.status ?? ""} className={inputClass}>
          <option value="">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select name="city" defaultValue={defaults.city ?? ""} className={inputClass}>
          <option value="">All cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <select name="trade" defaultValue={defaults.trade ?? ""} className={inputClass}>
          <option value="">All trades</option>
          {trades.map((trade) => (
            <option key={trade} value={trade}>
              {trade}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={defaults.sort ?? ""} className={inputClass}>
          <option value="">Newest first</option>
          <option value="nextFollowUp">Next follow-up</option>
          <option value="status">Status</option>
          <option value="city">City</option>
          <option value="trade">Trade</option>
        </select>
        <Button>
          <SlidersHorizontal size={16} />
          Filter
        </Button>
      </form>
    </Card>
  );
}
