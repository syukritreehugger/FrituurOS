import type { LocationKey } from '@/lib/constants';

const API_VERSION = '2024-10';

interface ShopifyConfig {
  domain: string;
  token: string;
}

function configForLocation(loc: LocationKey): ShopifyConfig | null {
  const map: Record<LocationKey, { domainEnv: string; tokenEnv: string }> = {
    LOC_AALST:   { domainEnv: 'SHOPIFY_AALST_DOMAIN',   tokenEnv: 'SHOPIFY_AALST_TOKEN' },
    LOC_BERLARE: { domainEnv: 'SHOPIFY_BERLARE_DOMAIN', tokenEnv: 'SHOPIFY_BERLARE_TOKEN' },
    LOC_DENDER:  { domainEnv: 'SHOPIFY_DENDER_DOMAIN',  tokenEnv: 'SHOPIFY_DENDER_TOKEN' },
    LOC_FRITURIST: { domainEnv: 'SHOPIFY_FRITURIST_DOMAIN', tokenEnv: 'SHOPIFY_FRITURIST_TOKEN' },
  };
  const cfg = map[loc];
  const domain = process.env[cfg.domainEnv];
  const token = process.env[cfg.tokenEnv];
  if (!domain || !token) return null;
  return { domain, token };
}

export interface ShopifyVariant {
  variant_id: number;
  product_id: number;
  product_title: string;
  product_handle: string;
  product_status: string;
  variant_title: string;
  sku: string;
  price: number;
}

interface RawProduct {
  id: number;
  title: string;
  handle: string;
  status: string;
  variants: Array<{
    id: number;
    sku: string | null;
    price: string;
    title: string;
  }>;
}

function parsePageInfo(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  const match = linkHeader.match(/<[^>]*[?&]page_info=([^&>]+)[^>]*>;\s*rel="next"/);
  return match ? match[1] : null;
}

export async function getProductsForLocation(
  loc: LocationKey
): Promise<{ ok: true; variants: ShopifyVariant[]; pages: number } | { ok: false; error: string }> {
  const cfg = configForLocation(loc);
  if (!cfg) {
    return {
      ok: false,
      error: `Shopify config not set for ${loc} — set SHOPIFY_*_DOMAIN and SHOPIFY_*_TOKEN env vars`,
    };
  }

  const variants: ShopifyVariant[] = [];
  let pageInfo: string | null = null;
  let pages = 0;
  const limit = 250;

  try {
    while (true) {
      const url = pageInfo
        ? `https://${cfg.domain}/admin/api/${API_VERSION}/products.json?limit=${limit}&page_info=${encodeURIComponent(pageInfo)}`
        : `https://${cfg.domain}/admin/api/${API_VERSION}/products.json?limit=${limit}`;

      const res = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': cfg.token,
          accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
      }

      const json = (await res.json()) as { products: RawProduct[] };
      pages += 1;

      for (const p of json.products) {
        for (const v of p.variants) {
          variants.push({
            variant_id: v.id,
            product_id: p.id,
            product_title: p.title,
            product_handle: p.handle,
            product_status: p.status,
            variant_title: v.title,
            sku: v.sku ?? '',
            price: Number(v.price ?? 0),
          });
        }
      }

      pageInfo = parsePageInfo(res.headers.get('link'));
      if (!pageInfo) break;
      if (pages >= 20) break;
    }

    return { ok: true, variants, pages };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export function isShopifyConfigured(loc: LocationKey): boolean {
  return configForLocation(loc) !== null;
}
