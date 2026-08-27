import { LocationsGrid } from "@/components/dashboard/locations-grid"
import { PageHeader } from "@/components/dashboard/page-header"
import { LOCATIONS, type LocationKey } from "@/lib/constants"
import { getDashboardStats } from "@/lib/queries/dashboard"

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ loc?: string }>;
}) {
  const { loc: rawLoc } = await searchParams;
  const loc = (rawLoc as LocationKey | undefined) ?? undefined;
  const stats = await getDashboardStats(loc)
  const filteredLocations = loc
    ? LOCATIONS.filter((l) => l.key === loc)
    : LOCATIONS;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Locations"
        title={`${LOCATIONS.length} frituur locations`}
        description="Each Lightspeed companyId routes orders to its own kitchen. Postcode-based routing handles cross-location delivery overflow."
      />

      <LocationsGrid data={stats.locationHealth} />

      <div className="card-elevated overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Location configuration
          </div>
          <div className="mt-0.5 text-[14px] font-medium">
            {filteredLocations.length}{" "}
            <span className="text-muted-foreground">
              {loc ? `of ${LOCATIONS.length} ` : ""}locations
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-2.5 text-left font-medium">Name</th>
                <th className="px-3 py-2.5 text-left font-medium">
                  Location key
                </th>
                <th className="px-3 py-2.5 text-left font-medium">
                  L-Series companyId
                </th>
                <th className="px-3 py-2.5 text-left font-medium">City</th>
                <th className="px-5 py-2.5 text-left font-medium">Postcode</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.map((l) => (
                <tr
                  key={l.key}
                  className="border-b border-border/60 last:border-b-0 hover:bg-muted/30"
                >
                  <td className="px-5 py-3 font-medium">{l.name}</td>
                  <td className="px-3 py-3 font-mono text-[11.5px] text-muted-foreground">
                    {l.key}
                  </td>
                  <td className="px-3 py-3 font-mono text-[11.5px] tabular-nums">
                    {l.companyId}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{l.city}</td>
                  <td className="px-5 py-3 tabular-nums text-muted-foreground">
                    {l.postcode}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
