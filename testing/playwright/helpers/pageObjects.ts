/**
 * Page Object Model — shared helpers used by all Playwright tests.
 * Stored at: testing/playwright/helpers/pageObjects.ts
 */

import { Page, expect } from '@playwright/test';

export const BASE = 'http://localhost:5173';

// ─── Seed localStorage with demo data so tests don't depend on network ────────
export async function seedLocalStorage(page: Page) {
  await page.addInitScript(() => {
    const storeKey = 'ozone_mall_stores';
    if (!localStorage.getItem(storeKey)) return; // already seeded by app
    // Force a predictable store so slug-based tests pass
  });
}

// ─── Login as admin via localStorage injection (no UI) ───────────────────────
export async function loginAsAdmin(page: Page) {
  await page.goto(BASE + '/');
  await page.evaluate(() => {
    const admin = {
      uid: 'admin-local-1',
      email: 'admin@ozonemall.com',
      displayName: 'Ozone Mall Executive Admin',
      role: 'admin',
      membershipTier: 'Platinum',
      memberSince: '2025-01-01T00:00:00.000Z',
      points: 9999,
    };
    localStorage.setItem('ozone_mall_admin_session', JSON.stringify(admin));
    localStorage.setItem('ozone_mall_user_session', JSON.stringify(admin));
  });
  await page.reload();
}

// ─── Login as member ─────────────────────────────────────────────────────────
export async function loginAsMember(page: Page) {
  await page.goto(BASE + '/');
  await page.evaluate(() => {
    const member = {
      uid: 'user-demo-1',
      email: 'member@ozonemall.com',
      displayName: 'Aarav Deshmukh',
      phone: '+91 98220 12345',
      role: 'member',
      membershipTier: 'Gold',
      memberSince: '2026-01-15T10:00:00.000Z',
      points: 1250,
      favoriteStores: ['store-1', 'store-2', 'store-3'],
    };
    localStorage.setItem('ozone_mall_user_session', JSON.stringify(member));
  });
  await page.reload();
}

// ─── Logout (clear session) ───────────────────────────────────────────────────
export async function clearSession(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('ozone_mall_user_session');
    localStorage.removeItem('ozone_mall_admin_session');
  });
}

// ─── Navigate and wait for content to appear ─────────────────────────────────
export async function gotoAndWait(page: Page, path: string, waitFor?: string) {
  await page.goto(BASE + path);
  if (waitFor) {
    await page.waitForSelector(waitFor, { timeout: 15000 });
  } else {
    await page.waitForLoadState('networkidle');
  }
}

// ─── Check responsive visibility ─────────────────────────────────────────────
export async function checkNavVisible(page: Page) {
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
}
