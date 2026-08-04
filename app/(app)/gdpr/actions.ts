'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { assertManagement } from '@/lib/auth/assert';

export interface DsarExportResult {
  email: string;
  canonical_orders: unknown[];
  raw_orders: unknown[];
  order_state_history: unknown[];
  audit_log: unknown[];
  exported_at: string;
}

export type DsarActionResult =
  | { ok: true; data: DsarExportResult }
  | { ok: false; error: string };

export async function exportDsar(email: string): Promise<DsarActionResult> {
  const auth = await assertManagement();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!email || !email.includes('@')) {
    return { ok: false, error: 'Valid email required' };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [canonical, audit] = await Promise.all([
    supabase
      .from('canonical_orders')
      .select(
        'id,source,external_ref,location_key,order_type,status,customer,items,payment,created_at,updated_at'
      )
      .filter('customer->>email', 'eq', email),
    supabase
      .from('audit_log')
      .select('id, action, subject_type, subject_id, created_at')
      .eq('actor_email', email)
      .limit(500),
  ]);

  // DSAR must only include the subject's own history — scope to their order IDs.
  const orderIds = (canonical.data ?? []).map((o) => o.id);
  const history =
    orderIds.length > 0
      ? await supabase
          .from('order_state_history')
          .select('id, canonical_order_id, from_state, to_state, occurred_at')
          .in('canonical_order_id', orderIds)
          .limit(500)
      : { data: [] };

  await supabase.from('audit_log').insert({
    actor_user_id: user.id,
    actor_email: user.email ?? '',
    action: 'gdpr.export',
    subject_type: 'dsar',
    subject_id: email,
    location_key: null,
    before: null as never,
    after: { email } as never,
  });

  return {
    ok: true,
    data: {
      email,
      canonical_orders: canonical.data ?? [],
      raw_orders: [],
      order_state_history: history.data ?? [],
      audit_log: audit.data ?? [],
      exported_at: new Date().toISOString(),
    },
  };
}

export async function deleteDsar(
  email: string
): Promise<{ ok: true; redacted: number } | { ok: false; error: string }> {
  const auth = await assertManagement();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!email || !email.includes('@')) {
    return { ok: false, error: 'Valid email required' };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: orders } = await supabase
    .from('canonical_orders')
    .select('id, customer')
    .filter('customer->>email', 'eq', email);

  let redacted = 0;
  for (const o of orders ?? []) {
    const cust = (o.customer ?? {}) as Record<string, unknown>;
    const redactedCust = {
      ...cust,
      first_name: '[REDACTED]',
      last_name: '[REDACTED]',
      email: '[REDACTED]',
      phone: '[REDACTED]',
      address: '[REDACTED]',
    };
    const { error } = await supabase
      .from('canonical_orders')
      .update({ customer: redactedCust as never })
      .eq('id', o.id);
    if (!error) redacted += 1;
  }

  await supabase.from('audit_log').insert({
    actor_user_id: user.id,
    actor_email: user.email ?? '',
    action: 'gdpr.delete',
    subject_type: 'dsar',
    subject_id: email,
    location_key: null,
    before: null as never,
    after: { email, redacted } as never,
  });

  revalidatePath('/gdpr');
  return { ok: true, redacted };
}
