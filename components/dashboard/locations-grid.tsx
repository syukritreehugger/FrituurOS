import { MapPin } from "lucide-react"
import { LOCATIONS } from "@/lib/constants"
import type { LocationHealth } from "@/lib/queries/dashboard"
import { cn } from "@/lib/utils"

function locMeta(key: string) {
  return LOCATIONS.find((l) => l.key === key)
}

function tierInfo(successRate: number, total: number) {
  // Zero-volume locations render as neutral "idle" — emerald 100% on no traffic
  // is dangerously misleading (looks healthy when it's actually silent).
  if (total === 0) {
    return {
      tier: "idle" as const,
      color: "text-muted-foreground",
      bg: "bg-muted",
      border: "border-border",
    }
  }
  const tier =
    successRate >= 99 ? "good" : successRate >= 95 ? "warn" : "bad"
  const color =
    tier === "good"
      ? "text-emerald-700 dark:text-emerald-400"
      : tier === "warn"
        ? "text-amber-700 dark:text-amber-400"
        : "text-rose-700 dark:text-rose-400"
  const bg =
    tier === "good"
      ? "bg-emerald-500/10"
      : tier === "warn"
        ? "bg-amber-500/10"
        : "bg-rose-500/10"
  const border =
    tier === "good"
      ? "border-emerald-500/20"
      : tier === "warn"
        ? "border-amber-500/30"
        : "border-rose-500/40"
  return { tier, color, bg, border }
}

function StatusDot({ tier }: { tier: string }) {
  if (tier === "bad") {
    return (
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
    )
  }
  return <span className="h-1.5 w-1.5 rounded-full bg-current" />
}

function Stat({
  label,
  value,
  className,
}: {
  label: string
  value: string | number
  className?: string
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "text-[18px] font-semibold tabular-nums leading-none mt-1",
          className,
        )}
      >
        {value}
      </div>
    </div>
  )
}

function LocationCard({ h }: { h: LocationHealth }) {
  const meta = locMeta(h.key)
  const { tier, color, bg, border } = tierInfo(h.successRate, h.total)

  return (
    <div
      className={cn(
        "card-elevated rounded-2xl border bg-card p-5",
        border,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[14px] font-semibold tracking-tight">
              {meta?.name ?? h.key}
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {meta ? `${meta.postcode} · ${meta.city}` : h.key}
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium",
            bg,
            color,
          )}
        >
          <StatusDot tier={tier} />
          {h.total === 0 ? "idle" : `${h.successRate}%`}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Total" value={h.total} />
        <Stat
          label="Failed"
          value={h.failed}
          className={
            h.failed > 0
              ? "text-rose-700 dark:text-rose-400"
              : "text-muted-foreground"
          }
        />
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Status
          </div>
          <div
            className={cn(
              "text-[14px] font-semibold leading-none mt-2 uppercase tracking-wider",
              color,
            )}
          >
            {tier}
          </div>
        </div>
      </div>
    </div>
  )
}

function LocationStrip({ h }: { h: LocationHealth }) {
  const meta = locMeta(h.key)
  const { tier, color, bg, border } = tierInfo(h.successRate, h.total)

  return (
    <div
      className={cn(
        "card-elevated flex items-center gap-6 rounded-2xl border bg-card px-6 py-4",
        border,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <span className="text-[14px] font-semibold tracking-tight">
            {meta?.name ?? h.key}
          </span>
          <span className="ml-2 text-[11px] text-muted-foreground">
            {meta ? `${meta.postcode} · ${meta.city}` : h.key}
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total
            </div>
            <div className="text-[18px] font-semibold tabular-nums leading-none mt-1">
              {h.total}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Failed
            </div>
            <div
              className={cn(
                "text-[18px] font-semibold tabular-nums leading-none mt-1",
                h.failed > 0
                  ? "text-rose-700 dark:text-rose-400"
                  : "text-muted-foreground",
              )}
            >
              {h.failed}
            </div>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
            bg,
            color,
          )}
        >
          <StatusDot tier={tier} />
          {h.total === 0 ? "idle" : `${h.successRate}%`}
        </span>
      </div>
    </div>
  )
}

export function LocationsGrid({ data }: { data: LocationHealth[] }) {
  if (data.length === 1) {
    return <LocationStrip h={data[0]!} />
  }

  const cols =
    data.length >= 4
      ? "md:grid-cols-2 xl:grid-cols-4"
      : data.length === 3
        ? "md:grid-cols-3"
        : "md:grid-cols-2"

  return (
    <div className={cn("grid grid-cols-1 gap-3", cols)}>
      {data.map((h) => (
        <LocationCard key={h.key} h={h} />
      ))}
    </div>
  )
}
