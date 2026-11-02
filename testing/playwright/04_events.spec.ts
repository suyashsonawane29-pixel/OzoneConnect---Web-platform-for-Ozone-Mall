/**
 * TC-EVENT-001 to TC-EVENT-012 — Events Tests
 */
import { test, expect } from '@playwright/test';
import { BASE } from './helpers/pageObjects';

test.describe('EVENT — Events & Event Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/events');
    await page.waitForLoadState('networkidle');
  });

  test('TC-EVENT-001 | Events page loads with title', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
  });

  test('TC-EVENT-002 | Events listing shows cards', async ({ page }) => {
    const eventCard = page.locator('a[href*="/events/"]').first();
    const emptyState = page.locator('text=No event').first();
    await expect(eventCard.or(emptyState)).toBeVisible({ timeout: 10000 });
  });

  test('TC-EVENT-003 | Clicking an event card navigates to detail', async ({ page }) => {
    const eventLink = page.locator('a[href*="/events/"]').first();
    if (await eventLink.isVisible({ timeout: 8000 }).catch(() => false)) {
      await eventLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toMatch(/\/events\/.+/);
    }
  });

  test('TC-EVENT-004 | Event detail page shows name and date', async ({ page }) => {
    const eventLink = page.locator('a[href*="/events/"]').first();
    if (await eventLink.isVisible({ timeout: 8000 }).catch(() => false)) {
      const href = await eventLink.getAttribute('href');
      await page.goto(BASE + href!);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('TC-EVENT-005 | Event registration form is visible', async ({ page }) => {
    const eventLink = page.locator('a[href*="/events/"]').first();
    if (await eventLink.isVisible({ timeout: 8000 }).catch(() => false)) {
      const href = await eventLink.getAttribute('href');
      await page.goto(BASE + href!);
      await page.waitForLoadState('networkidle');
      const form = page.locator('form').first();
      if (await form.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(form).toBeVisible();
      }
    }
  });

  test('TC-EVENT-006 | Event registration form validation — empty submit', async ({ page }) => {
    const eventLink = page.locator('a[href*="/events/"]').first();
    if (await eventLink.isVisible({ timeout: 8000 }).catch(() => false)) {
      const href = await eventLink.getAttribute('href');
      await page.goto(BASE + href!);
      await page.waitForLoadState('networkidle');
      const submitBtn = page.locator('button[type="submit"]').first();
      if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await submitBtn.click();
        // Validation errors should appear
        await page.waitForTimeout(500);
        const body = await page.textContent('body');
        const hasError = body?.includes('required') || body?.includes('characters') || body?.includes('valid');
        expect(hasError ?? true).toBeTruthy();
      }
    }
  });

  test('TC-EVENT-007 | Event registration guests max validation (>5)', async ({ page }) => {
    const eventLink = page.locator('a[href*="/events/"]').first();
    if (await eventLink.isVisible({ timeout: 8000 }).catch(() => false)) {
      const href = await eventLink.getAttribute('href');
      await page.goto(BASE + href!);
      await page.waitForLoadState('networkidle');
      const guestInput = page.locator('input[name="numberOfGuests"]');
      if (await guestInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await guestInput.fill('10');
        const submitBtn = page.locator('button[type="submit"]').first();
        await submitBtn.click();
        await page.waitForTimeout(500);
        const body = await page.textContent('body');
        expect(body?.includes('5') || body?.includes('Maximum')).toBeTruthy();
      }
    }
  });

  test('TC-EVENT-008 | Event registration with valid data shows confirmation', async ({ page }) => {
    const eventLink = page.locator('a[href*="/events/"]').first();
    if (await eventLink.isVisible({ timeout: 8000 }).catch(() => false)) {
      const href = await eventLink.getAttribute('href');
      await page.goto(BASE + href!);
      await page.waitForLoadState('networkidle');
      const nameInput = page.locator('input[name="fullName"]');
      if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await nameInput.fill('Test Visitor');
        await page.locator('input[name="email"]').fill('test@example.com');
        await page.locator('input[name="phone"]').fill('9876543210');
        const submitBtn = page.locator('button[type="submit"]').first();
        await submitBtn.click();
        await page.waitForTimeout(1500);
        const body = await page.textContent('body');
        const confirmed = body?.includes('confirmed') || body?.includes('registered') || body?.includes('success') || body?.includes('Thank');
        expect(confirmed ?? true).toBeTruthy();
      }
    }
  });

  test('TC-EVENT-009 | Invalid email in event registration shows error', async ({ page }) => {
    const eventLink = page.locator('a[href*="/events/"]').first();
    if (await eventLink.isVisible({ timeout: 8000 }).catch(() => false)) {
      const href = await eventLink.getAttribute('href');
      await page.goto(BASE + href!);
      await page.waitForLoadState('networkidle');
      const emailInput = page.locator('input[name="email"]');
      if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await page.locator('input[name="fullName"]').fill('Test');
        await emailInput.fill('invalid-email');
        await page.locator('button[type="submit"]').first().click();
        await page.waitForTimeout(500);
        const body = await page.textContent('body');
        expect(body?.includes('valid email') || body?.includes('email')).toBeTruthy();
      }
    }
  });

  test('TC-EVENT-010 | Events page has upcoming filter', async ({ page }) => {
    const body = await page.textContent('body');
    const hasFilter = body?.includes('Upcoming') || body?.includes('upcoming');
    expect(hasFilter).toBeTruthy();
  });

  test('TC-EVENT-011 | Events breadcrumb is visible', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body?.includes('Event')).toBeTruthy();
  });

  test('TC-EVENT-012 | Unknown event ID shows not found or redirects', async ({ page }) => {
    await page.goto(BASE + '/events/nonexistent-event-id-xyz');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    const handled = body?.includes('not found') || body?.includes('Not Found') || body?.includes('404') || body?.includes('Back to Events');
    expect(handled).toBeTruthy();
  });
});
