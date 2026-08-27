'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import {
  activateWorkflow,
  deactivateWorkflow,
  POLLER_NORMALIZE_ID,
  LS_PUSHER_ID,
  setTakeawayPollersActive,
  SHIPDAY_PUSH_WORKFLOW_ID,
} from '@/lib/n8n';
import { createClient } from '@/lib/supabase/server';

async function assertManagement(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  // Dev-bypass mirror of middleware/server-client: only honored outside production.
  if (
    process.env['NEXT_PUBLIC_DEV_SKIP_AUTH'] === '1' &&
    process.env.NODE_ENV !== 'production'
  ) {
    return { ok: true };
  }

  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const role =
    (user.app_metadata?.['role'] as string | undefined) ?? 'management';
  if (role !== 'management' && role !== 'admin') {
    return { ok: false, error: 'Insufficient role' };
  }

  // CSRF-lite: server actions in Next.js verify Origin against host; we
  // additionally reject missing Origin to harden against direct-POST replay.
  const hdrs = await headers();
  const origin = hdrs.get('origin');
  if (origin === null) {
    return { ok: false, error: 'Missing Origin header' };
  }

  return { ok: true };
}

export async function setPipelineActive(
  active: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await assertManagement();
  if (!auth.ok) return auth;

  const toggle = active ? activateWorkflow : deactivateWorkflow;

  const [pollerRes, pusherRes] = await Promise.all([
    toggle(POLLER_NORMALIZE_ID),
    toggle(LS_PUSHER_ID),
  ]);

  // Detect partial failure — rollback the half that did succeed.
  if (pollerRes.ok && !pusherRes.ok) {
    const compensate = active ? deactivateWorkflow : activateWorkflow;
    await compensate(POLLER_NORMALIZE_ID).catch(() => undefined);
    return { ok: false, error: `Pusher: ${pusherRes.error} (poller rolled back)` };
  }
  if (!pollerRes.ok && pusherRes.ok) {
    const compensate = active ? deactivateWorkflow : activateWorkflow;
    await compensate(LS_PUSHER_ID).catch(() => undefined);
    return { ok: false, error: `Poller: ${pollerRes.error} (pusher rolled back)` };
  }
  if (!pollerRes.ok) return { ok: false, error: `Poller: ${pollerRes.error}` };
  if (!pusherRes.ok) return { ok: false, error: `Pusher: ${pusherRes.error}` };

  revalidatePath('/settings');
  revalidatePath('/');
  return { ok: true };
}

export async function setTakeawayPollerActive(
  active: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await assertManagement();
  if (!auth.ok) return auth;

  // Alle per-locatie JET-pollers, niet alleen Aalst (C3).
  // LOC_FRITURIST heeft er geen: die zaak heeft geen takeaway.com-account.
  const res = await setTakeawayPollersActive(active);

  if (!res.ok) return { ok: false, error: res.error };

  revalidatePath('/settings');
  revalidatePath('/');
  return { ok: true };
}

export async function setShipdayDispatchActive(
  active: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await assertManagement();
  if (!auth.ok) return auth;

  const res = active
    ? await activateWorkflow(SHIPDAY_PUSH_WORKFLOW_ID)
    : await deactivateWorkflow(SHIPDAY_PUSH_WORKFLOW_ID);

  if (!res.ok) return { ok: false, error: res.error };

  revalidatePath('/settings');
  revalidatePath('/integrations');
  revalidatePath('/');
  return { ok: true };
}
