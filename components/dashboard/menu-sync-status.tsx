import { Check, Clock } from "lucide-react"
import { LOCATIONS } from "@/lib/constants"
import type { MenuSyncRow } from "@/lib/queries/health"
import { cn } from "@/lib/utils"

function timeAgo(iso: string | null): string {
  if (!iso) return "never"
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

export function MenuSyncStatus({
  lastSyncAt,
  rows,
}: {
  lastSyncAt: string | null
  rows: MenuSyncRow[]
}) {
  const hasData = rows.length > 0
  const totalChanges = rows.reduce((s, r) => s + r.changes, 0)
  const totalDrift = rows.reduce((s, r) => s + r.drift, 0)

  return (
    <div className="card-elevated rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Menu sync
          </div>
          <div className="mt-0.5 text-[14px] font-medium">
            Lightspeed → Shopify
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="mt-4 rounded-xl border border-dashed border-border px-4 py-8 text-center text-[12px] text-muted-foreground">
          Menu sync not configured yet. This feature will compare Lightspeed
          product catalog with Shopify listings across all locations.
        </div>
      ) : (
        <>
          <div
            className={cn(
              "mt-4 flex items-center gap-2 rounded-xl border px-3 py-2.5",
              totalDrift === 0
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-amber-500/30 bg-amber-500/5",
            )}
          >
            <Check
              className={cn(
                "h-4 w-4",
                totalDrift === 0 ? "text-emerald-600" : "text-amber-600",
              )}
            />
            <div className="flex-1 text-[12px]">
              <span
                className={cn(
                  "font-medium",
                  totalDrift === 0 ? "text-emerald-700" : "text-amber-700",
                )}
              >
                {totalDrift === 0 ? "Last sync clean" : `${totalDrift} drift items`}
              </span>{" "}
              <span className="text-muted-foreground">
                — {totalChanges} price updates
              </span>
            </div>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {timeAgo(lastSyncAt)}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LOCATIONS.map((loc) => {
              const r = rows.find((x) => x.location_key === loc.key)
              return (
                <div
                  key={loc.key}
                  className="rounded-xl border border-border bg-background p-3"
                >
                  <div className="text-[12px] font-medium">{loc.name}</div>
                  <div className="mt-1 text-[10.5px] text-muted-foreground">
                    {timeAgo(r?.last_sync_at ?? null)}
                  </div>
                  <div className="mt-3 flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Δ</span>
                    <span className="font-semibold tabular-nums">
                      {r?.changes ?? 0}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Drift</span>
                    <span
                      className={cn(
                        "font-semibold tabular-nums",
                        (r?.drift ?? 0) > 0
                          ? "text-amber-700 dark:text-amber-400"
                          : "",
                      )}
                    >
                      {r?.drift ?? 0}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-[11.5px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              Next scheduled sync at{" "}
              <span className="font-medium text-foreground">04:00 CET</span>.
              Lightspeed remains the source of truth.
            </span>
          </div>
        </>
      )}
    </div>
  )
}
