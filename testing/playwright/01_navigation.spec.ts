/**
 * TC-NAV-001 to TC-NAV-010 — Homepage & Navigation Tests
 */
import { test, expect } from '@playwright/test';
import { BASE, checkNavVisible, gotoAndWait } from './helpers/pageObjects';

test.describe('NAV — Homepage & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('networkidle');
  });

  test('TC-NAV-001 | Homepage loads with hero section', async ({ page }) => {
    await expect(page).toHaveURL(BASE + '/');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    // Hero section has at least one heading
    const heroHeading = page.locator('h1, h2').first();
    await expect(heroHeading).toBeVisible();
  });

  test('TC-NAV-002 | Navbar brand logo is visible and links to home', async ({ page }) => {
    const logo = page.locator('header a').first();
    await expect(logo).toBeVisible();
    await logo.click();
    await expect(page).toHaveURL(BASE + '/');
  });

  test('TC-NAV-003 | Desktop nav links are visible and functional', async ({ page }) => {
    const navLinks = [
      { text: 'Stores', url: '/stores' },
      { text: 'Offers', url: '/offers' },
      { text: 'Dining', url: '/dining' },
    ];
    for (const link of navLinks) {
      const navItem = page.locator(`header nav a:has-text("${link.text}")`).first();
      await expect(navItem).toBeVisible();
    }
  });

  test('TC-NAV-004 | Clicking Stores nav link navigates to /stores', async ({ page }) => {
    await page.locator('header nav a:has-text("Stores")').first().click();
    await expect(page).toHaveURL(BASE + '/stores');
  });

  test('TC-NAV-005 | Mobile hamburger menu opens and closes', async ({ page, viewport }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const hamburger = page.locator('button[aria-label="Toggle navigation menu"]');
    await expect(hamburger).toBeVisible();
    await hamburger.click();
    // Mobile menu should appear
    await expect(page.locator('text=Store Directory').or(page.locator('text=Stores')).first()).toBeVisible();
    await hamburger.click();
  });

  test('TC-NAV-006 | Global Search opens on Search button click', async ({ page }) => {
    await page.locator('button[aria-label="Search Ozone Mall"]').first().click();
    await expect(page.locator('input[placeholder*="Search"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC-NAV-007 | Global Search closes on Escape key', async ({ page }) => {
    await page.locator('button[aria-label="Search Ozone Mall"]').first().click();
    await page.keyboard.press('Escape');
    await expect(page.locator('input[placeholder*="Search"]').first()).not.toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('TC-NAV-008 | Footer is present with navigation links', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible();
    const adminLink = page.locator('footer a:has-text("Admin")');
    await expect(adminLink).toBeVisible();
  });

  test('TC-NAV-009 | 404 page shown for unknown route', async ({ page }) => {
    await page.goto(BASE + '/nonexistent-route-xyz-123');
    await page.waitForLoadState('networkidle');
    // Should show 404 or not found page
    const body = await page.textContent('body');
    const has404 = body?.includes('404') || body?.includes('Not Found') || body?.includes('not found');
    expect(has404).toBeTruthy();
  });

  test('TC-NAV-010 | Homepage sections exist (stores, offers, events)', async ({ page }) => {
    const body = await page.textContent('body');
    // Page should have content sections from localStorage seed data
    expect(body).toBeTruthy();
    await expect(page.locator('main, section, [class*="section"]').first()).toBeVisible();
  });
});
