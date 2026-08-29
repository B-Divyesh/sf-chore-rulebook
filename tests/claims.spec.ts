import { expect, test } from '@playwright/test';

test('@claim:offline-reload works after the HTTP cache is cleared', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const session = await context.newCDPSession(page);
  await session.send('Network.clearBrowserCache');
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved to your rulebook')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Today’s household chores' })).toBeVisible();
});

test('@claim:device-local free actions send requests only to this origin', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/demo');
  await page.getByRole('button', { name: 'People' }).click();
  const firstSwitch = page.getByRole('checkbox').first();
  await firstSwitch.focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Data' }).click();
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
});

test('@claim:json-export downloads every sample collection', async ({ page }) => {
  await page.goto('/demo?view=data');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  const state = JSON.parse(await (await import('node:fs/promises')).readFile(await download.path() as string, 'utf8'));
  expect(state).toMatchObject({ householdName: 'Cedar House' });
  expect(state.people).toHaveLength(3);
  expect(state.chores).toHaveLength(4);
  expect(state.completions).toHaveLength(4);
});

test('@claim:csv-export downloads one row for each completion', async ({ page }) => {
  await page.goto('/demo?view=history');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  const csv = await (await import('node:fs/promises')).readFile(await download.path() as string, 'utf8');
  expect(csv.split('\n')).toHaveLength(5);
  expect(csv).toContain('"completed_at","due_at","chore","person","estimated_minutes","note"');
});

test('@claim:explain-assignment states why the sample assignee was chosen', async ({ page }) => {
  await page.goto('/demo');
  await page.getByText('Why this assignment?').first().click();
  await expect(page.locator('details[open]')).toContainText(/household order|fixed-owner rule/);
  await page.getByRole('button', { name: 'People' }).click();
  await expect(page.getByText('Away · rotations skip this person')).toBeVisible();
});

test('@claim:six-chore-tier stops the seventh chore in the free rulebook', async ({ page }) => {
  await page.goto('/demo?view=chores');
  for (const name of ['Vacuum hallway', 'Put bins out']) {
    await page.locator('#view-root').getByRole('button', { name: 'Add chore' }).click();
    await page.getByLabel('Chore name').fill(name);
    await page.getByRole('dialog').getByRole('button', { name: 'Add chore', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  }
  await page.locator('#view-root').getByRole('button', { name: 'Add chore' }).click();
  await expect(page.getByText('The free rulebook holds 6 chores. Household Plus removes that limit.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Move, back up, or unlock' })).toBeVisible();
});

test('@claim:qr-pairing draws a realistic local snapshot without uploading it', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:chore-rulebook', 'cached-test-license');
    localStorage.setItem('sb_license:chore-rulebook:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  const external: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url()); });
  await page.goto('/demo');
  await page.evaluate(async () => {
    const request = indexedDB.open('demo:chore-rulebook', 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const state = await new Promise<any>((resolve, reject) => { const read = db.transaction('household').objectStore('household').get('current'); read.onsuccess = () => resolve(read.result); read.onerror = () => reject(read.error); });
    state.chores.push(
      { id: 'demo-hall', name: 'Vacuum the hallway', intervalDays: 3, effortMinutes: 20, rule: 'rotation', missedPolicy: 'hold', createdAt: '2026-06-01T00:00:00.000Z' },
      { id: 'demo-bins', name: 'Put the bins out', intervalDays: 7, effortMinutes: 15, rule: 'fixed', fixedPersonId: 'demo-alex', missedPolicy: 'hold', createdAt: '2026-06-01T00:00:00.000Z' },
    );
    state.completions = Array.from({ length: 40 }, (_, index) => ({ id: `large-${index}`, choreId: state.chores[index % state.chores.length].id, personId: state.people[index % state.people.length].id, completedAt: `2026-07-${String(index % 28 + 1).padStart(2, '0')}T12:00:00.000Z`, dueAt: `2026-07-${String(index % 28 + 1).padStart(2, '0')}`, note: `Checked filters and wiped the shared surface ${index}.` }));
    await new Promise<void>((resolve, reject) => { const tx = db.transaction('household', 'readwrite'); tx.objectStore('household').put(state, 'current'); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
    db.close();
  });
  await page.goto('/demo?view=data');
  await page.getByRole('button', { name: 'Create pairing sheet' }).click();
  const canvas = page.locator('#pair-code');
  await expect(canvas).toBeVisible();
  await expect.poll(() => canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL().length)).toBeGreaterThan(2_000);
  await expect(page.getByText('The pairing code could not be drawn.')).toBeHidden();
  expect(external).toEqual([]);
});

test('@claim:demo-isolation resets sample data without touching real data', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Set up this household' }).click();
  await page.getByLabel('Household name').fill('Real Home');
  await page.getByLabel('People').fill('Morgan');
  await page.getByRole('button', { name: 'Create rulebook' }).click();
  await expect(page.getByText('Add the first household rule')).toBeVisible();
  await page.goto('/demo');
  await expect(page.getByText('Cedar House').first()).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Cedar House').first()).toBeVisible();
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.getByText('Real Home').first()).toBeVisible();
});
