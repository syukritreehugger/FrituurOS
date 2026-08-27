import { test, expect, type Page } from '@playwright/test';

/**
 * Srova production smoke suite — Tipzakske (LOC_AALST) go-live verification.
 *
 * PUBLIC tests run against the deployed URL without credentials and verify
 * that the auth wall + brand + login page are healthy.
 *
 * AUTHENTICATED tests opt in via E2E_USER + E2E_PASS env vars. Without them
 * the suite skips the authenticated block — the public smoke alone proves
 * the deploy didn't regress the auth posture.
 */

const E2E_USER = process.env['E2E_USER'];
const E2E_PASS = process.env['E2E_PASS'];

const NAV_VISIBLE = [
  { href: '/', label: 'Overview' },
  { href: '/orders', label: 'Orders' },
  { href: '/pipeline', label: 'Pipeline' },
  { href: '/alerts', label: 'Alerts' },
  { href: '/locations', label: 'Locations' },
  { href: '/menu', label: 'Menu sync' },
  { href: '/integrations', label: 'Integration Store' },
  { href: '/settings', label: 'Settings' },
] as const;

const ON_DEV_HIDDEN = [
  '/audit',
  '/mappings',
  '/opening-times',
  '/snooze',
  '/restaurant-status',
  '/gdpr',
] as const;

async function expectNoCrash(page: Page) {
  const body = await page.locator('body').innerText();
  expect(body, 'page should not render a 500 / error wall').not.toMatch(
    /Application error|500\s*Internal/i
  );
}

async function loginVia(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(E2E_USER!);
  await page.getByLabel(/password/i).fill(E2E_PASS!);
  await page.getByRole('button', { name: /sign in|login/i }).click();
  await page.waitForURL(/^https?:\/\/[^/]+\/(?!login).*/, { timeout: 15_000 });
}

// ───────────────────────────── PUBLIC SMOKE ─────────────────────────────

test.describe('Public: auth wall + brand', () => {
  test('login page renders with Srova brand', async ({ page }) => {
    const resp = await page.goto('/login');
    expect(resp?.status()).toBe(200);
    await expect(page).toHaveTitle(/Srova/);
    await expect(page.getByText(/sign in|srova/i).first()).toBeVisible();
  });

  test('protected root redirects unauthenticated → /login', async ({ page }) => {
    const resp = await page.goto('/');
    // After the redirect we land on /login
    await expect(page).toHaveURL(/\/login(\?.*)?$/);
    expect(resp?.status()).toBeLessThan(500);
  });

  for (const p of [...NAV_VISIBLE.map((n) => n.href), ...ON_DEV_HIDDEN]) {
    test(`unauthenticated GET ${p} → /login`, async ({ page }) => {
      await page.goto(p);
      await expect(page, `${p} should bounce to /login`).toHaveURL(/\/login(\?.*)?$/);
    });
  }
});

// ─────────────────────────── AUTHENTICATED SMOKE ───────────────────────────

const describeAuth = E2E_USER && E2E_PASS ? test.describe : test.describe.skip;

describeAuth('Authenticated: sidebar + every visible page renders', () => {
  test.beforeEach(async ({ page }) => {
    await loginVia(page);
  });

  test('sidebar shows only stable nav items, no On Dev pill', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('aside').first();
    for (const item of NAV_VISIBLE) {
      await expect(sidebar.getByRole('link', { name: item.label })).toBeVisible();
    }
    const onDevLabels = [
      'Audit log',
      'Mappings',
      'Opening times',
      'Snooze',
      'Online/Offline',
      'GDPR / DSAR',
    ];
    for (const label of onDevLabels) {
      await expect(sidebar.getByRole('link', { name: label })).toHaveCount(0);
    }
    await expect(sidebar.getByText(/^On Dev$/)).toHaveCount(0);
  });

  for (const item of NAV_VISIBLE) {
    test(`nav: ${item.label} (${item.href})`, async ({ page }) => {
      const resp = await page.goto(item.href);
      expect(resp?.status(), `${item.href} should not 500`).toBeLessThan(500);
      await expectNoCrash(page);
      await expect(page.locator('aside').first()).toBeVisible();
    });
  }
});

describeAuth('Authenticated: OnDev routes return 404', () => {
  test.beforeEach(async ({ page }) => {
    await loginVia(page);
  });

  for (const href of ON_DEV_HIDDEN) {
    test(`direct URL ${href} → not-found`, async ({ page }) => {
      const resp = await page.goto(href);
      const status = resp?.status() ?? 0;
      const text = await page.locator('body').innerText();
      const looksLikeNotFound =
        status === 404 || /not.?found|404|This page could not be found/i.test(text);
      expect(looksLikeNotFound, `${href} should be hidden (status=${status})`).toBeTruthy();
    });
  }
});

describeAuth('Authenticated: widget + backend wiring', () => {
  test.beforeEach(async ({ page }) => {
    await loginVia(page);
  });

  test('KPI cards render on Overview', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByText(/Orders today|Revenue|Success rate/i).first()
    ).toBeVisible({ timeout: 15_000 });
    await expectNoCrash(page);
  });

  test('Pipeline flow + Locations grid render', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByText(/received|normalized|pushing|complete/i).first()
    ).toBeVisible({ timeout: 15_000 });
    await expectNoCrash(page);
  });

  test('Orders page lists rows OR empty state', async ({ page }) => {
    await page.goto('/orders');
    await expectNoCrash(page);
    const hasContent = await Promise.race([
      page
        .getByRole('table')
        .first()
        .waitFor({ timeout: 10_000 })
        .then(() => true)
        .catch(() => false),
      page
        .getByText(/no orders|empty|0 orders/i)
        .first()
        .waitFor({ timeout: 10_000 })
        .then(() => true)
        .catch(() => false),
    ]);
    expect(hasContent).toBeTruthy();
  });

  test('Alerts page renders without OnDev pill', async ({ page }) => {
    await page.goto('/alerts');
    await expectNoCrash(page);
    await expect(page.locator('main').getByText(/^On Dev$/)).toHaveCount(0);
  });

  test('Settings page renders pipeline toggle without OnDev banner', async ({ page }) => {
    await page.goto('/settings');
    await expectNoCrash(page);
    await expect(page.getByText(/pipeline/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Secret management and access controls/i)).toHaveCount(0);
  });

  test('Menu sync (/menu) loads Tipzakske mapping', async ({ page }) => {
    await page.goto('/menu?loc=LOC_AALST');
    await expectNoCrash(page);
    const ok = await Promise.race([
      page
        .getByText(/matched|shopify.?only|ls.?only|mismatch/i)
        .first()
        .waitFor({ timeout: 20_000 })
        .then(() => true)
        .catch(() => false),
      page
        .getByRole('table')
        .first()
        .waitFor({ timeout: 20_000 })
        .then(() => true)
        .catch(() => false),
    ]);
    expect(ok).toBeTruthy();
  });

  test('Pipeline page renders queue/health widget', async ({ page }) => {
    await page.goto('/pipeline');
    await expectNoCrash(page);
    await expect(
      page.getByText(/queue|backlog|retry|latency|live/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('Locations page renders frituur cards', async ({ page }) => {
    await page.goto('/locations');
    await expectNoCrash(page);
    await expect(
      page.getByText(/Aalst|Berlare|Dender|Tipzakske|Frietbooster|Frietchalet/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});

describeAuth('Authenticated: Integration Store', () => {
  test.beforeEach(async ({ page }) => {
    await loginVia(page);
  });

  test('Integration Store page loads and shows all store cards', async ({ page }) => {
    await page.goto('/integrations');
    await expectNoCrash(page);
    await expect(page.getByText(/tipzakske/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/frietbooster/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/frietchalet/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/friturist/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('Tipzakske card shows Active state', async ({ page }) => {
    await page.goto('/integrations');
    await expectNoCrash(page);
    const tipzakskeCard = page
      .locator(':is(article, [class*="card"], div)', { hasText: /tipzakske/i })
      .first();
    await expect(tipzakskeCard).toBeVisible({ timeout: 15_000 });
    await expect(tipzakskeCard.getByText(/accepting orders|active/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('Frietbooster card shows Paused state', async ({ page }) => {
    await page.goto('/integrations');
    await expectNoCrash(page);
    const frietboosterCard = page
      .locator(':is(article, [class*="card"], div)', { hasText: /frietbooster/i })
      .first();
    await expect(frietboosterCard).toBeVisible({ timeout: 15_000 });
    await expect(frietboosterCard.getByText(/paused/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('Frietchalet card shows Paused state', async ({ page }) => {
    await page.goto('/integrations');
    await expectNoCrash(page);
    const frietchaletCard = page
      .locator(':is(article, [class*="card"], div)', { hasText: /frietchalet/i })
      .first();
    await expect(frietchaletCard).toBeVisible({ timeout: 15_000 });
    await expect(frietchaletCard.getByText(/paused/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('Friturist card shows Active state', async ({ page }) => {
    await page.goto('/integrations');
    await expectNoCrash(page);
    const frituristCard = page
      .locator(':is(article, [class*="card"], div)', { hasText: /friturist/i })
      .first();
    await expect(frituristCard).toBeVisible({ timeout: 15_000 });
    await expect(frituristCard.getByText(/accepting orders|active/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
