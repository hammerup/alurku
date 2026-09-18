import { test, expect } from '@playwright/test';

test.describe('Smoke E2E Test Suite - alurku.', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost';

  test('1. Landing Page renders branding, typography, and essential CTA', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('body')).toContainText('alurku.');
    const cta = page.locator('text=/Mulai Rapikan|Coba Gratis|Masuk/i').first();
    await expect(cta).toBeVisible({ timeout: 10000 });
  });

  test('2. Permalinks & Navigation test (/masuk, /dokumentasi, /harga)', async ({ page }) => {
    await page.goto(BASE_URL + '/dokumentasi');
    await expect(page.locator('body')).toContainText(/Dokumentasi|Documentation/i);

    await page.goto(BASE_URL + '/harga');
    await expect(page.locator('body')).toContainText(/Harga|Pricing|Seat/i);

    await page.goto(BASE_URL + '/masuk');
    await expect(page.locator('input[type="text"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('3. Login validation & Wrong password attempt warning', async ({ page }) => {
    await page.goto(BASE_URL + '/masuk');
    const testUser = 'smoke_' + Date.now();
    await page.locator('input[type="text"]').first().fill(testUser);
    await page.locator('input[type="password"]').first().fill('WrongPass123!');
    await page.locator('button[type="submit"]').first().click();

    const warningOrNotif = page.locator('text=/sisa.*percobaan|attempt.*remaining|salah|invalid/i').first();
    await expect(warningOrNotif).toBeVisible({ timeout: 10000 });
  });

  test('4. Successful Login with Superadmin', async ({ page }) => {
    await page.goto(BASE_URL + '/masuk');
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('AdminAlurku2026!');
    await page.locator('button[type="submit"]').first().click();
    await expect(page).toHaveURL(/.*(\/dashboard|\/$)/, { timeout: 15000 });
  });

  test('5. Public Documentation Permalinks & SEO (/dokumentasi/my-tasks, /dokumentasi/workspace-chat)', async ({ page }) => {
    await page.goto(BASE_URL + '/dokumentasi/my-tasks');
    await expect(page.locator('h1')).toContainText(/Tugas Saya|My Tasks/i);
    await expect(page).toHaveTitle(/Tugas Saya|My Tasks.*alurku\./i);

    await page.goto(BASE_URL + '/dokumentasi/workspace-chat');
    await expect(page.locator('h1')).toContainText(/Obrolan Tim|Workspace Chat/i);
    await expect(page).toHaveTitle(/Obrolan Tim|Workspace Chat.*alurku\./i);
  });
});
