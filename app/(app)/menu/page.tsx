import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { LOCATIONS, type LocationKey } from "@/lib/constants";
import { getMenuMapping, type MappingStatus } from "@/lib/queries/menu-mapping";
import { getTakeawayMapping, getLsProductsForPicker } from "@/lib/queries/takeaway-mapping";
import { MappingStats } from "./_components/mapping-stats";
import { MappingTable } from "./_components/mapping-table";
import { TakeawayMappingTable } from "./_components/takeaway-mapping-table";
import { BulkConfirmTakeaway } from "./_components/bulk-confirm-takeaway";
import { cn } from "@/lib/utils";

const VALID_FILTERS: ReadonlyArray<MappingStatus | "all" | "issues"> = [
  "all",
  "issues",
  "matched",
  "auto_split",
  "shopify_only",
  "ls_only",
  "mismatch",
];

function isValidFilter(v: string | undefined): v is MappingStatus | "all" | "issues" {
  return !!v && (VALID_FILTERS as ReadonlyArray<string>).includes(v);
}

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

const SHOPIFY_DOMAIN_BY_LOC: Record<LocationKey, string> = {
  LOC_AALST: "tipzakske.myshopify.com",
  LOC_BERLARE: "frietbooster.myshopify.com",
  LOC_DENDER: "de-frietchalet.myshopify.com",
  LOC_FRITURIST: "friturist.myshopify.com",
};

type Channel = "shopify" | "takeaway";

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ loc?: string; filter?: string; channel?: string }>;
}) {
  const sp = await searchParams;
  const rawLoc = sp.loc as LocationKey | undefined;
  const loc: LocationKey = rawLoc && LOCATIONS.some((l) => l.key === rawLoc)
    ? rawLoc
    : "LOC_AALST";

  const channel: Channel = sp.channel === "takeaway" ? "takeaway" : "shopify";
  const filter = isValidFilter(sp.filter) ? sp.filter : "all";

  const locInfo = LOCATIONS.find((l) => l.key === loc)!;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Menu sync · Product mapping"
        title={channel === "shopify" ? "Shopify SKU ↔ Lightspeed PLU" : "Takeaway name ↔ Lightspeed PLU"}
        description={
          channel === "shopify"
            ? "Simple SKUs (e.g. F2, B11) match LS PLU 1:1. Compound SKUs (e.g. B11__Veelsaus) auto-split — only the base PLU needs to exist in LS; the suffix prints as a kitchen note. Price diffs between Shopify and LS are handled at push time: the higher price always wins."
            : "Takeaway.com sends product names (not SKUs). Map each name to a Lightspeed PLU so orders push without errors. New names appear here as orders come in."
        }
        actions={
          <Button size="sm" asChild className="h-9 gap-2 rounded-full text-[13px]">
            <Link href={`/menu?channel=${channel}&loc=${loc}${filter !== "all" && channel === "shopify" ? `&filter=${filter}` : ""}`}>
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Link>
          </Button>
        }
      />

      <div className="flex items-center gap-2 border-b border-border pb-3">
        {(["shopify", "takeaway"] as const).map((ch) => {
          const active = ch === channel;
          return (
            <Link
              key={ch}
              href={`/menu?channel=${ch}&loc=${loc}`}
              className={cn(
                "inline-flex h-8 items-center rounded-full px-4 text-[12px] font-medium",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {ch === "shopify" ? "Shopify → LS" : "Takeaway → LS"}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {LOCATIONS.map((l) => {
          const active = l.key === loc;
          return (
            <Link
              key={l.key}
              href={`/menu?channel=${channel}&loc=${l.key}${filter !== "all" && channel === "shopify" ? `&filter=${filter}` : ""}`}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full px-4 text-[12.5px] font-medium",
                active
                  ? "bg-foreground text-background"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {l.name}
              <span className="text-[11px] opacity-70">{l.city}</span>
            </Link>
          );
        })}
      </div>

      {channel === "shopify" ? (
        <ShopifyMappingSection loc={loc} filter={filter} />
      ) : (
        <TakeawayMappingSection loc={loc} />
      )}
    </div>
  );
}

async function ShopifyMappingSection({ loc, filter }: { loc: LocationKey; filter: MappingStatus | "all" | "issues" }) {
  const mapping = await getMenuMapping(loc);
  const shopifyDomain = SHOPIFY_DOMAIN_BY_LOC[loc];

  return (
    <>
      <div className="text-[11.5px] text-muted-foreground">
        Last LS sync: <span className="font-medium text-foreground">{timeAgo(mapping.last_ls_sync)}</span>
        <span className="mx-2">·</span>
        Shopify: <span className="font-mono text-[11px]">{shopifyDomain}</span>
      </div>

      {!mapping.shopify_configured && mapping.shopify_error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 text-[12.5px] text-rose-700 dark:text-rose-400">
          <div className="font-semibold">Shopify connection error</div>
          <div className="mt-1 opacity-90">{mapping.shopify_error}</div>
        </div>
      )}

      <MappingStats
        matched={mapping.matched}
        auto_split={mapping.auto_split}
        shopify_only={mapping.shopify_only}
        ls_only={mapping.ls_only}
        mismatch={mapping.mismatch}
        total_shopify={mapping.total_shopify_variants}
        total_lightspeed={mapping.total_ls_products}
      />

      {mapping.shopify_no_sku > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-[12px] text-amber-800 dark:text-amber-300">
          <span className="font-semibold">
            {mapping.shopify_no_sku} Shopify variant(s) without SKU
          </span>{" "}
          — these can&apos;t be matched to Lightspeed PLU. Set SKU in Shopify Admin to enable mapping.
        </div>
      )}

      <MappingTable
        rows={mapping.rows}
        filter={filter}
        basePath={`/menu?channel=shopify&loc=${loc}`}
        shopifyDomain={shopifyDomain}
      />

      <div className="rounded-2xl border border-border bg-muted/30 p-4 text-[11.5px] text-muted-foreground leading-relaxed">
        <span className="font-semibold text-foreground">How this works:</span>{" "}
        Shopify SKUs come in two shapes:
        <br />
        <br />
        <span className="font-semibold text-foreground">1. Simple SKU</span> (e.g.{" "}
        <code className="font-mono text-[11px]">F2</code>,{" "}
        <code className="font-mono text-[11px]">B11</code>) — must match the LS PLU
        exactly (case-sensitive). Shows as{" "}
        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
          Matched
        </span>{" "}
        when both sides line up.
        <br />
        <br />
        <span className="font-semibold text-foreground">2. Compound SKU</span> (e.g.{" "}
        <code className="font-mono text-[11px]">B11__Veelsaus</code>,{" "}
        <code className="font-mono text-[11px]">B17__ck3__colamenu</code>) — Srova
        auto-splits on <code className="font-mono text-[11px]">__</code>. The first
        part is the base PLU sent to LS; remaining parts print as kitchen notes
        (e.g. &quot;+ Veel saus&quot;). Shows as{" "}
        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
          Auto-split
        </span>{" "}
        when the base PLU exists in LS. <em>Only the base PLU needs to exist in LS</em>{" "}
        — modifier suffixes can be any free text.
        <br />
        <br />
        If an order arrives with a SKU whose base PLU doesn&apos;t exist in LS, the
        push fails with error 11401 (DLQ alert appears at <code>/alerts</code>). The
        LS catalog syncs to Supabase daily via the n8n workflow{" "}
        <code className="font-mono text-[11px]">sync_lightspeed_products</code>;
        Shopify products are fetched live on every page load.
        <br />
        <br />
        <span className="font-semibold text-foreground">Price source-of-truth:</span>{" "}
        When Shopify and LS prices differ on the same SKU,{" "}
        <code className="font-mono text-[11px]">push_lightspeed_order</code> always
        uses <strong>MAX(shopify, ls_catalog)</strong> — the higher of the two wins.
        Drift between systems doesn&apos;t cause any push failure or need a fix; the
        LS receipt always prints the correct (higher) price. Catalog drift surfaces as
        a small italic note under the LS price for visibility, not as a blocking issue.
      </div>
    </>
  );
}

async function TakeawayMappingSection({ loc }: { loc: LocationKey }) {
  const [mapping, lsProducts] = await Promise.all([
    getTakeawayMapping(loc),
    getLsProductsForPicker(loc),
  ]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={mapping.total} tone="default" />
        <StatCard label="Unmapped" value={mapping.unmapped} tone={mapping.unmapped > 0 ? "rose" : "default"} />
        <StatCard label="Auto-matched" value={mapping.auto_matched} tone="amber" />
        <StatCard label="Confirmed" value={mapping.confirmed} tone="emerald" />
      </div>

      <BulkConfirmTakeaway locationKey={loc} autoMatchedCount={mapping.auto_matched} />

      {mapping.unmapped > 0 && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-[12px] text-rose-700 dark:text-rose-400">
          <span className="font-semibold">
            {mapping.unmapped} Takeaway product{mapping.unmapped === 1 ? "" : "s"} not mapped
          </span>{" "}
          — orders containing these products will fail with PLU validation (error 11401). Map them below.
        </div>
      )}

      <TakeawayMappingTable rows={mapping.rows} lsProducts={lsProducts} />

      <div className="rounded-2xl border border-border bg-muted/30 p-4 text-[11.5px] text-muted-foreground leading-relaxed">
        <span className="font-semibold text-foreground">How this works:</span>{" "}
        Takeaway.com has no SKU — they send product names like &quot;Bicky burger&quot;,
        &quot;Boulet&quot;. Srova auto-matches each name against the Lightspeed catalog
        on exact (case-insensitive) match, then shows the suggestion here as{" "}
        <span className="font-semibold text-amber-700 dark:text-amber-400">
          Auto-matched
        </span>{" "}
        for you to review. Click <strong>Confirm</strong> (per row or bulk above) to
        approve. Rows you reject can be re-mapped by picking a different PLU.
        <br />
        <br />
        <span className="font-semibold text-foreground">Modifiers (specifications):</span>{" "}
        Takeaway sends order options like &quot;Special saus | TK&quot;, &quot;Zonder
        zout&quot; as nested <code className="font-mono text-[11px]">specifications</code>{" "}
        on each product. These are <em>pass-through only</em> — no mapping needed.
        They print on the Lightspeed kitchen receipt as descriptions under the main
        product, with their prices preserved so the totals reconcile exactly.
      </div>
    </>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "default" | "rose" | "amber" | "emerald" }) {
  const toneClass = {
    default: "text-foreground",
    rose: "text-rose-600 dark:text-rose-400",
    amber: "text-amber-600 dark:text-amber-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
  }[tone];

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-[24px] font-semibold tabular-nums", toneClass)}>{value}</div>
    </div>
  );
}
