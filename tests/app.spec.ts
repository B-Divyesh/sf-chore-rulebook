import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function buildHousehold(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Set up this household' }).click();
  await page.getByLabel('Household name').fill('Cedar House');
  await page.getByLabel('People').fill('Alex, Bo, Casey');
  await page.getByRole('button', { name: 'Create rulebook' }).click();
  await expect(page.getByText('Add the first household rule')).toBeVisible();
}

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
  await expect(page.getByRole('heading', { name: 'Completion history' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Kitchen reset' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('has no serious accessibility violations in the empty state', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
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
  await expect(page.getByRole('heading', { name: 'Know whose turn it is—and why.' })).toBeVisible();
  await expect(page.getByText(/OFFLINE/).first()).toBeVisible();
});
