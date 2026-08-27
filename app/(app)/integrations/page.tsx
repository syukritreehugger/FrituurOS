import Link from 'next/link';
import { ArrowRight, Circle } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { getStoreIntegrations, type StoreIntegrationRow } from '@/lib/queries/integration-store';
import { StoreToggle } from './_components/store-toggle';
import { DeliverectToggle } from './_components/deliverect-toggle';

// Always re-render server-side — channels surface token TTL, queue depth,
// and n8n workflow state that change minute-to-minute. Disable Next caching.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Tone = 'emerald' | 'amber' | 'rose' | 'zinc';

const TONE_DOT: Record<Tone, string> = {
  emerald: 'text-emerald-500 fill-emerald-500',
  amber: 'text-amber-500 fill-amber-500',
  rose: 'text-rose-500 fill-rose-500',
  zinc: 'text-zinc-400 fill-zinc-400',
};

function relTime(iso: string | null): string {
  if (!iso) return 'never';
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function ChannelRow({
  label,
  tone,
  detail,
}: {
  label: string;
  tone: Tone;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-[12px]">
      <div className="flex items-center gap-2">
        <Circle className={`h-2 w-2 ${TONE_DOT[tone]}`} strokeWidth={0} />
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className="font-medium tabular-nums">{detail}</span>
    </div>
  );
}

function shopifyChannel(row: StoreIntegrationRow): { tone: Tone; detail: string } {
  const iso = row.shopify_last_webhook_at;
  if (!iso) return { tone: 'zinc', detail: 'no webhook yet' };
  const ageMs = Date.now() - new Date(iso).getTime();
  const dayMs = 86_400_000;
  if (ageMs < dayMs) return { tone: 'emerald', detail: relTime(iso) };
  if (ageMs < 7 * dayMs) return { tone: 'amber', detail: relTime(iso) };
  return { tone: 'zinc', detail: relTime(iso) };
}

function lsChannel(row: StoreIntegrationRow): { tone: Tone; detail: string } {
  if (!row.is_active) {
    return { tone: 'zinc', detail: 'store paused' };
  }
  if (row.deliverect_active) {
    return { tone: 'amber', detail: 'yielding to Deliverect' };
  }
  if (!row.ls_token_ok || !row.ls_token_expires_at) {
    return { tone: 'rose', detail: 'token expired' };
  }
  const mins = Math.max(
    0,
    Math.floor((new Date(row.ls_token_expires_at).getTime() - Date.now()) / 60000)
  );
  return { tone: 'emerald', detail: `token ${mins}m TTL` };
}

function takeawayChannel(row: StoreIntegrationRow): { tone: Tone; detail: string } {
  const total = row.takeaway_account_count;
  const active = row.takeaway_active_count;
  if (total === 0) return { tone: 'zinc', detail: 'not configured' };
  if (active === 0) return { tone: 'amber', detail: `${active}/${total} active` };
  return { tone: 'emerald', detail: `${active}/${total} active` };
}

function shipdayChannel(row: StoreIntegrationRow): { tone: Tone; detail: string } {
  // Per-store gate trumps global — if store paused, Shipday won't fire.
  if (!row.is_active) {
    return { tone: 'zinc', detail: 'store paused' };
  }
  if (row.deliverect_active) {
    return { tone: 'amber', detail: 'yielding to Deliverect' };
  }
  if (!row.shipday_dispatch_active) {
    return { tone: 'zinc', detail: 'dispatcher paused (global)' };
  }
  const n = row.shipday_dispatched_24h;
  if (n === 0) {
    if (row.shipday_last_dispatched_at) {
      return { tone: 'emerald', detail: `ready · last ${relTime(row.shipday_last_dispatched_at)}` };
    }
    return { tone: 'emerald', detail: 'ready · Takeaway only' };
  }
  return { tone: 'emerald', detail: `${n} dispatched 24h` };
}

function cardBorder(row: StoreIntegrationRow): string {
  if (!row.is_active) return 'border-border';
  if (row.ls_token_ok) return 'border-emerald-500/30';
  return 'border-amber-500/30';
}

export default async function IntegrationsPage() {
  const rows = await getStoreIntegrations();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Operations · Per-store"
        title="Integration Store"
        description="Each store's master toggle gates ALL channels (Lightspeed POS + Shipday dispatch + Takeaway poller). Toggle OFF a store and nothing reaches its POS or driver pool, even if global toggles in /settings are ON."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {rows.map((row) => {
          const shopify = shopifyChannel(row);
          const ls = lsChannel(row);
          const takeaway = takeawayChannel(row);
          return (
            <div
              key={row.location_key}
              className={`card-elevated flex flex-col gap-4 rounded-2xl border bg-card p-5 ${cardBorder(row)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Circle
                      className={`h-2 w-2 ${
                        row.is_active ? TONE_DOT.emerald : TONE_DOT.zinc
                      }`}
                      strokeWidth={0}
                    />
                    <span className="text-[15px] font-semibold">{row.name}</span>
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {row.city} · {row.postcode}
                  </div>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground">
                  {row.location_key}
                </span>
              </div>

              <StoreToggle
                locationKey={row.location_key}
                locationName={row.name}
                initialActive={row.is_active}
              />

              <DeliverectToggle
                locationKey={row.location_key}
                initialActive={row.deliverect_active}
              />

              <div className="rounded-xl border border-border bg-background/50 px-3 py-2">
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Channels
                </div>
                <ChannelRow label="Shopify webhook" tone={shopify.tone} detail={shopify.detail} />
                <ChannelRow label="Lightspeed POS" tone={ls.tone} detail={ls.detail} />
                <ChannelRow label="Shipday dispatch" tone={shipdayChannel(row).tone} detail={shipdayChannel(row).detail} />
                <ChannelRow label="Takeaway poller" tone={takeaway.tone} detail={takeaway.detail} />
              </div>

              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">
                  24h:{' '}
                  <span className="font-medium tabular-nums text-foreground">
                    {row.orders_24h}
                  </span>{' '}
                  orders ·{' '}
                  <span className="font-medium tabular-nums text-foreground">
                    {row.success_rate_24h}%
                  </span>{' '}
                  success
                </span>
              </div>

              <div className="flex gap-2 border-t border-border pt-3 text-[11.5px]">
                <Link
                  href={`/orders?loc=${row.location_key}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 font-medium hover:bg-muted"
                >
                  View orders <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  href={`/audit?loc=${row.location_key}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 font-medium hover:bg-muted"
                >
                  Audit log <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
