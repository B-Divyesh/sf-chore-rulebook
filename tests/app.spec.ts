import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function buildHousehold(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Set up this household' }).click();
  await page.getByLabel('Household name').fill('Cedar House');
  await page.getByLabel('People').fill('Alex, Bo, Casey');
  await page.getByRole('button', { name: 'Create rulebook' }).click();
  await expect(page.getByText('Add the first household rule')).toBeVisible();
}

test('first screen has one job heading, both first actions, and three visible facts', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Chore Rulebook — clear household rotations');
  await expect(page.locator('h1')).toHaveText('Know whose turn it is—and why');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByText('For households sharing recurring chores')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Set up this household' })).toBeVisible();
  await expect(page.locator('.principles li')).toHaveCount(3);
  const facts = await page.locator('.principles').boundingBox();
  expect((facts?.y ?? 0) + (facts?.height ?? 0)).toBeLessThanOrEqual(await page.evaluate(() => innerHeight));
});

test('creates a household, explains a rotation, records work, and persists it', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle(/Chore Rulebook/);
  await expect(page.locator('h1')).toHaveCount(1);
  await buildHousehold(page);

  await page.getByRole('button', { name: 'Add a chore' }).click();
  await page.getByLabel('Chore name').fill('Kitchen reset');
  await page.getByLabel('Repeat every').fill('1');
  await page.getByLabel('Estimated effort').fill('25');
  await page.getByRole('button', { name: 'Add chore', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Kitchen reset' })).toBeVisible();
  await page.getByText('Why this assignment?').click();
  await expect(page.getByText(/household order/)).toBeVisible();
  await page.getByRole('button', { name: 'Mark done' }).click();
  await page.getByRole('button', { name: 'Record completion' }).click();
  await page.getByRole('button', { name: 'History' }).click();
  await expect(page.getByRole('heading', { name: 'Kitchen reset' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Completion history', level: 2 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Kitchen reset' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('has no serious accessibility violations in the empty state', async ({ page }) => {
  await page.goto('/');
  // Axe's published type currently targets a newer Playwright patch than the
  // factory-pinned browser version; the runtime Page contract is compatible.
  const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});

test('has no serious accessibility violations in every populated view', async ({ page }) => {
  await page.goto('/demo');
  for (const name of ['Today', 'People', 'Chores', 'History', 'Data']) {
    await page.getByRole('button', { name }).click();
    const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')), name).toEqual([]);
  }
});

test('opens and closes the setup dialog from the keyboard with focus restored', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Set up this household' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('legal pages render directly with one main heading', async ({ page }) => {
  for (const path of ['/privacy', '/terms']) {
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  }
});

test('reloads the installed shell while offline', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Know whose turn it is—and why' })).toBeVisible();
  await expect(page.getByText(/OFFLINE/).first()).toBeVisible();
});

test('Back restores the view named by the URL', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'People' }).click();
  await page.getByRole('button', { name: 'Data' }).click();
  await page.goBack();
  await expect(page).toHaveURL(/view=people/);
  await expect(page.getByRole('heading', { name: 'People and availability', exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Move, back up, or unlock' })).toBeHidden();
});

test('rejects whitespace-only household, person, and chore names', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Set up this household' }).click();
  await page.getByLabel('Household name').fill('   ');
  await page.getByLabel('People').fill('Alex');
  await page.getByRole('button', { name: 'Create rulebook' }).click();
  await expect(page.getByRole('alert')).toContainText('Enter a household name');
  await page.getByLabel('Household name').fill('Cedar House');
  await page.getByRole('button', { name: 'Create rulebook' }).click();
  await page.getByRole('button', { name: 'People' }).click();
  await page.getByRole('button', { name: 'Add person' }).click();
  await page.getByLabel('Name').fill('   ');
  await page.getByRole('dialog').getByRole('button', { name: 'Add person', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Enter a person’s name');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Chores' }).click();
  await page.getByRole('button', { name: 'Add chore' }).click();
  await page.getByLabel('Chore name').fill('   ');
  await page.getByRole('dialog').getByRole('button', { name: 'Add chore', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Enter a chore name');
});

test('rejects malformed typed fields and remains usable after reload', async ({ page }) => {
  await page.goto('/demo?view=data');
  const malformed = {
    version: 1, householdName: 'Broken Home',
    people: [{ id: 'p1', name: 'Alex', available: true, createdAt: '2026-01-01T00:00:00.000Z' }],
    chores: [{ id: 'c1', name: 'Dishes', intervalDays: '7', effortMinutes: 20, rule: 'rotation', missedPolicy: 'hold', createdAt: 'not-a-date' }],
    completions: [], updatedAt: '2026-01-01T00:00:00.000Z',
  };
  await page.getByLabel('Choose a Chore Rulebook JSON backup').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(malformed)) });
  await expect(page.getByText('That backup has invalid fields and was not imported.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Move and back up your data' })).toBeVisible();
});

test('desktop and mobile views stay within the viewport with 44px controls', async ({ page }) => {
  await page.goto('/demo?view=people');
  const peopleWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(peopleWidth).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
  await page.getByRole('button', { name: 'Chores' }).click();
  const choresWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(choresWidth).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
  await page.getByRole('button', { name: 'Today' }).click();
  for (const locator of [page.locator('.brand'), page.locator('summary').first(), page.getByRole('link', { name: 'Privacy' })]) {
    const box = await locator.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test('recovers from invalid data already stored by an older release', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const request = indexedDB.open('chore-rulebook', 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const broken = { version: 1, householdName: 'Broken', people: [{ id: 'p', name: 'Alex', available: true, createdAt: 'bad' }], chores: [], completions: [], updatedAt: 'bad' };
    await new Promise<void>((resolve, reject) => { const tx = db.transaction('household', 'readwrite'); tx.objectStore('household').put(broken, 'current'); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
    db.close();
  });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Know whose turn it is—and why' })).toBeVisible();
  await expect(page.getByText('Invalid saved data was set aside.')).toBeVisible();
});

test('offers the registered one-time Household Plus checkout', async ({ page }) => {
  await page.goto('/demo?view=data');
  await expect(page.getByRole('heading', { name: '$12 one-time purchase' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy Household Plus' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/chore-rulebook/checkout');
  await expect(page.getByRole('button', { name: 'Have a license? Restore it' })).toBeVisible();
});
