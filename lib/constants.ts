// Production-locked constants. These values must match canonical_orders.status
// Postgres ENUM and dim_location.location_key exactly. Do not invent new keys here.

export const LOCATIONS = [
  { key: 'LOC_AALST',   name: 'Tipzakske',    city: 'Aalst',       postcode: '9300', companyId: 45905  },
  { key: 'LOC_BERLARE', name: 'Frietbooster', city: 'Berlare',     postcode: '9290', companyId: 145352 },
  { key: 'LOC_DENDER',  name: 'Frietchalet',  city: 'Dendermonde', postcode: '9200', companyId: 145351 },
  // 46197 is de Lightspeed API companyId (JWT `cid`), geen billing-id.
  { key: 'LOC_FRITURIST', name: 'De Friturist', city: 'Herzele', postcode: '9550', companyId: 46197 },
] as const;

export type LocationKey = typeof LOCATIONS[number]['key'];

export const ORDER_STATES = [
  'received',
  'normalized',
  'pushing_ls',
  'ls_sent',
  'ls_accepted',
  'ls_rejected',
  'ls_failed',
  'shipday_sent',
  'complete',
  'cancelled',
] as const;

export type OrderState = typeof ORDER_STATES[number];

export const STATE_LABEL: Record<OrderState, string> = {
  received: 'Received',
  normalized: 'Processing',
  pushing_ls: 'Sending to POS',
  ls_sent: 'Sent to POS',
  ls_accepted: 'POS accepted',
  ls_rejected: 'POS rejected',
  ls_failed: 'POS failed',
  shipday_sent: 'Dispatched',
  complete: 'Complete',
  cancelled: 'Cancelled',
};

export const STATE_TONE: Record<OrderState, string> = {
  received: 'bg-muted text-muted-foreground',
  normalized: 'bg-muted text-muted-foreground',
  pushing_ls: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  ls_sent: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  ls_accepted: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  shipday_sent: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
  complete: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  ls_failed: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
  ls_rejected: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
  cancelled: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-400',
};
