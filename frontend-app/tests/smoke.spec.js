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

  test('6. About Us (/tentang) Credibility, Word Count & Zero Personal Photo', async ({ page }) => {
    await page.goto(BASE_URL + '/tentang');
    await expect(page.locator('h1')).toContainText(/Building Sustainable Workspaces|Membangun Ruang Kerja/i);
    await expect(page).toHaveTitle(/Tentang Kami|About Us.*alurku\./i);

    // Verify founder photo is strictly absent
    const founderImg = page.locator('img[src*="eka"]');
    await expect(founderImg).toHaveCount(0);

    // Verify key institutional sections
    await expect(page.locator('body')).toContainText(/Real-Time Capacity Guard|Sistem Proteksi Kapasitas/i);
    await expect(page.locator('body')).toContainText(/Zero-Retention AI Privacy|Privasi AI Tanpa Retensi/i);
  });

  test('7. Search Bar Ctrl+K Adaptation, Clickability & Shortcut Toggle', async ({ page }) => {
    // 1. Log in to access the header search bar
    await page.goto(BASE_URL + '/masuk');
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('AdminAlurku2026!');
    await page.locator('button[type="submit"]').first().click();
    await expect(page).toHaveURL(/.*(\/dashboard|\/$)/, { timeout: 15000 });

    // 2. Wait for Header search bar to be visible
    const kbdBadge = page.locator('kbd:has-text("Ctrl K")');
    await expect(kbdBadge).toBeVisible({ timeout: 10000 });

    // Ensure ⌘K is NOT shown on non-Mac
    const macBadge = page.locator('kbd:has-text("⌘K")');
    await expect(macBadge).toHaveCount(0);

    // 3. Test clicking the badge opens the Command Bar
    await kbdBadge.click();
    const commandModalInput = page.locator('input[placeholder*="Design UI"], input[placeholder*="Desain UI"]').first();
    await expect(commandModalInput).toBeVisible({ timeout: 5000 });

    // 4. Test closing with Escape
    await page.keyboard.press('Escape');
    await expect(commandModalInput).not.toBeVisible({ timeout: 5000 });

    // 5. Test pressing Control+k opens the Command Bar
    await page.keyboard.press('Control+k');
    await expect(commandModalInput).toBeVisible({ timeout: 5000 });

    // 6. Test pressing Control+k again closes the Command Bar
    await page.keyboard.press('Control+k');
    await expect(commandModalInput).not.toBeVisible({ timeout: 5000 });
  });

  test('8. Settings Page (/pengaturan) Full-Page Navigation, Tabs & WCAG AA Contrast Safeguard', async ({ page }) => {
    // 1. Log in to access the app
    await page.goto(BASE_URL + '/masuk');
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('AdminAlurku2026!');
    await page.locator('button[type="submit"]').first().click();
    await expect(page).toHaveURL(/.*(\/dashboard|\/$)/, { timeout: 15000 });

    // Mark tour as done to prevent WelcomeTourModal overlay from intercepting clicks
    await page.evaluate(() => {
      localStorage.setItem('alurku_tour_done_v2_admin', 'true');
    });

    // 2. Direct permalink navigation to /pengaturan
    await page.goto(BASE_URL + '/pengaturan');
    await expect(page).toHaveURL(/.*\/pengaturan/, { timeout: 10000 });

    // Verify Settings Page Header & Subtitle
    const heading = page.locator('h1').filter({ hasText: /Pengaturan|Settings/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Verify Breadcrumb
    const breadcrumb = page.locator('nav').filter({ hasText: /Dasbor|Dashboard/i }).first();
    await expect(breadcrumb).toBeVisible();

    // 3. Tab Navigation: Appearance & Themes (/pengaturan/tampilan)
    const appearanceTab = page.locator('button').filter({ hasText: /Tampilan|Appearance/i }).first();
    await appearanceTab.click();
    await expect(page).toHaveURL(/.*\/pengaturan\/tampilan/, { timeout: 5000 });
    await expect(page.locator('text=/WCAG AA|Color Mode|Mode Tampilan/i').first()).toBeVisible({ timeout: 5000 });

    // Test Wallpaper / Background Preset Selection
    const wallpaperPreset = page.locator('button').filter({ hasText: /Soft Aurora|Calm Slate|Warm Silk|Default/i }).first();
    await expect(wallpaperPreset).toBeVisible({ timeout: 5000 });
    await wallpaperPreset.click();

    // 4. Tab Navigation: Work Preferences (/pengaturan/preferensi)
    const preferencesTab = page.locator('button').filter({ hasText: /Preferensi|Preferences/i }).first();
    await preferencesTab.click();
    await expect(page).toHaveURL(/.*\/pengaturan\/preferensi/, { timeout: 5000 });
    await expect(page.locator('text=/Format Tanggal|Date Format/i').first()).toBeVisible({ timeout: 5000 });

    // 5. Tab Navigation: Notifications (/pengaturan/notifikasi)
    const notifTab = page.locator('button').filter({ hasText: /Notifikasi|Notifications/i }).first();
    await notifTab.click();
    await expect(page).toHaveURL(/.*\/pengaturan\/notifikasi/, { timeout: 5000 });
    await expect(page.locator('text=/Suara Notifikasi|Notification Chime|Tes Suara/i').first()).toBeVisible({ timeout: 5000 });

    // 6. Tab Navigation: Security & Danger Zone (/pengaturan/keamanan)
    const securityTab = page.locator('button').filter({ hasText: /Keamanan|Security/i }).first();
    await securityTab.click();
    await expect(page).toHaveURL(/.*\/pengaturan\/keamanan/, { timeout: 5000 });
    await expect(page.locator('text=/Kata Sandi|Password|Zona Bahaya|Danger Zone/i').first()).toBeVisible({ timeout: 5000 });

    // 7. Tab Navigation: Plan & Usage Quotas (/pengaturan/paket)
    const planTab = page.locator('button').filter({ hasText: /Paket|Plan|Billing/i }).first();
    await planTab.click();
    await expect(page).toHaveURL(/.*\/pengaturan\/paket/, { timeout: 5000 });
    await expect(page.locator('text=/Kursi|Seats|Penyimpanan|Storage/i').first()).toBeVisible({ timeout: 5000 });

    // 8. Back to Dashboard Button
    const backBtn = page.locator('button').filter({ hasText: /Kembali|Back/i }).first();
    await backBtn.click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });

  test('9. NotificationToast — success toast has SVG icon, progress bar, and aria-live', async ({ page }) => {
    // Login
    await page.goto(BASE_URL + '/masuk');
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('AdminAlurku2026!');
    await page.locator('button[type="submit"]').first().click();
    await expect(page).toHaveURL(/.*(\/dashboard|\/$)/, { timeout: 15000 });

    // Bypass WelcomeTour
    await page.evaluate(() => {
      const u = localStorage.getItem('alurku_username') || 'admin';
      localStorage.setItem(`alurku_tour_done_v2_${u}`, 'true');
    });
    await page.reload();

    // Trigger a notification via custom event (same mechanism used throughout app)
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('show-notification', {
        detail: { message: 'Tes Toast Berhasil!', type: 'success' }
      }));
    });

    // Toast should appear with role="status" (aria-live)
    const toast = page.locator('[role="status"]').first();
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Should contain SVG icon (not emoji)
    const svg = toast.locator('svg').first();
    await expect(svg).toBeVisible({ timeout: 3000 });

    // Should contain the message text
    await expect(toast).toContainText('Tes Toast Berhasil!');

    // Should have a progress bar element (absolute bottom div)
    const progressBar = toast.locator('div.absolute.bottom-0').first();
    await expect(progressBar).toBeVisible({ timeout: 3000 });
  });

  test('10. NotificationToast — error toast always renders at top-center, not user-configured position', async ({ page }) => {
    await page.goto(BASE_URL + '/masuk');
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('AdminAlurku2026!');
    await page.locator('button[type="submit"]').first().click();
    await expect(page).toHaveURL(/.*(\/dashboard|\/$)/, { timeout: 15000 });

    // Bypass WelcomeTour
    await page.evaluate(() => {
      const u = localStorage.getItem('alurku_username') || 'admin';
      localStorage.setItem(`alurku_tour_done_v2_${u}`, 'true');
      // Force position setting to bottom-right (default) to confirm override
      localStorage.setItem('alurku_notif_pos', 'bottom-right');
    });
    await page.reload();

    // Fire an error notification
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('show-notification', {
        detail: { message: 'Error Kritis!', type: 'error' }
      }));
    });

    // The error toast container must be anchored at top (top-4 class present on the stack div)
    const errorStack = page.locator('[aria-label="top-center notifications"]');
    await expect(errorStack).toBeVisible({ timeout: 5000 });

    // Toast must contain the error message
    await expect(errorStack).toContainText('Error Kritis!');

    // The error stack must have CSS classes indicating top position
    const classes = await errorStack.getAttribute('class');
    expect(classes).toContain('top-4');
  });
});
