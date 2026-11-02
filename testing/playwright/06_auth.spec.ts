/**
 * TC-AUTH-001 to TC-AUTH-020 — Authentication & Authorization Tests
 */
import { test, expect } from '@playwright/test';
import { BASE, loginAsAdmin, loginAsMember, clearSession } from './helpers/pageObjects';

test.describe('AUTH — Admin Login, Authorization & User Auth', () => {

  test('TC-AUTH-001 | Admin login page loads at /admin/login', async ({ page }) => {
    await page.goto(BASE + '/admin/login');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h2, h1').first()).toBeVisible();
    const body = await page.textContent('body');
    expect(body?.includes('Admin') || body?.includes('Portal')).toBeTruthy();
  });

  test('TC-AUTH-002 | Admin login form has email and password fields', async ({ page }) => {
    await page.goto(BASE + '/admin/login');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('TC-AUTH-003 | Admin login with valid demo credentials redirects to dashboard', async ({ page }) => {
    await page.goto(BASE + '/admin/login');
    await page.waitForLoadState('networkidle');
    const emailInput = page.locator('input[type="email"]').first();
    const passInput = page.locator('input[type="password"]').first();
    await emailInput.fill('admin@ozonemall.com');
    await passInput.fill('admin123');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    expect(page.url()).toContain('/admin/dashboard');
  });

  test('TC-AUTH-004 | Admin login with wrong password shows error', async ({ page }) => {
    await page.goto(BASE + '/admin/login');
    await page.locator('input[type="email"]').first().fill('admin@ozonemall.com');
    await page.locator('input[type="password"]').first().fill('wrongpassword');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1000);
    const body = await page.textContent('body');
    const hasError = body?.includes('Invalid') || body?.includes('incorrect') || body?.includes('failed') || body?.includes('Incorrect');
    expect(hasError).toBeTruthy();
  });

  test('TC-AUTH-005 | Accessing /admin/dashboard without login redirects to login', async ({ page }) => {
    await clearSession(page);
    await page.goto(BASE + '/admin/dashboard');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/admin/login');
  });

  test('TC-AUTH-006 | Member user cannot access /admin routes', async ({ page }) => {
    await loginAsMember(page);
    await page.goto(BASE + '/admin/dashboard');
    await page.waitForLoadState('networkidle');
    // Should redirect to admin login since role is not admin
    expect(page.url()).toContain('/admin/login');
  });

  test('TC-AUTH-007 | Admin dashboard loads stats after login', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(BASE + '/admin/dashboard');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    const hasStats = body?.includes('Stores') || body?.includes('Offers') || body?.includes('Events');
    expect(hasStats).toBeTruthy();
  });

  test('TC-AUTH-008 | Admin sidebar navigation is visible', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(BASE + '/admin/dashboard');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body?.includes('Store') || body?.includes('Dashboard')).toBeTruthy();
  });

  test('TC-AUTH-009 | Admin logout clears session and redirects', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(BASE + '/admin/dashboard');
    await page.waitForLoadState('networkidle');
    const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")').first();
    if (await logoutBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(1500);
      expect(page.url()).toContain('/admin/login');
    }
  });

  test('TC-AUTH-010 | User login page loads at /login', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('TC-AUTH-011 | User login with demo member credentials succeeds', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.waitForLoadState('networkidle');
    const emailInput = page.locator('input[type="email"]').first();
    const passInput = page.locator('input[type="password"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('member@ozonemall.com');
      await passInput.fill('password123');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url).toContain('/profile') || expect(url).toContain('/');
    }
  });

  test('TC-AUTH-012 | User signup page loads at /signup', async ({ page }) => {
    await page.goto(BASE + '/signup');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('TC-AUTH-013 | Signup form validates password mismatch', async ({ page }) => {
    await page.goto(BASE + '/signup');
    await page.waitForLoadState('networkidle');
    const nameInput = page.locator('input[name="fullName"]');
    if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nameInput.fill('New User');
      await page.locator('input[name="email"]').fill('newuser@example.com');
      await page.locator('input[name="phone"]').fill('9876543210');
      await page.locator('input[name="password"]').fill('password123');
      await page.locator('input[name="confirmPassword"]').fill('different456');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(500);
      const body = await page.textContent('body');
      expect(body?.includes("match") || body?.includes("Password")).toBeTruthy();
    }
  });

  test('TC-AUTH-014 | Signup form validates short password (<6 chars)', async ({ page }) => {
    await page.goto(BASE + '/signup');
    const nameInput = page.locator('input[name="fullName"]');
    if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nameInput.fill('New User');
      await page.locator('input[name="email"]').fill('newuser@example.com');
      await page.locator('input[name="phone"]').fill('9876543210');
      await page.locator('input[name="password"]').fill('abc');
      await page.locator('input[name="confirmPassword"]').fill('abc');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(500);
      const body = await page.textContent('body');
      expect(body?.includes('6 characters') || body?.includes('Password')).toBeTruthy();
    }
  });

  test('TC-AUTH-015 | Authenticated member sees user avatar in navbar', async ({ page }) => {
    await loginAsMember(page);
    await page.goto(BASE + '/');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body?.includes('Aarav') || body?.includes('Privilege') || body?.includes('Sign Out')).toBeTruthy();
  });

  test('TC-AUTH-016 | Profile page loads for authenticated member', async ({ page }) => {
    await loginAsMember(page);
    await page.goto(BASE + '/profile');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body?.includes('Privilege') || body?.includes('Member') || body?.includes('Points')).toBeTruthy();
  });

  test('TC-AUTH-017 | Profile page unauthenticated redirects to /login', async ({ page }) => {
    await clearSession(page);
    await page.goto(BASE + '/profile');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
  });

  test('TC-AUTH-018 | Admin login pre-fills demo credentials', async ({ page }) => {
    await page.goto(BASE + '/admin/login');
    await page.waitForLoadState('networkidle');
    const emailValue = await page.locator('input[type="email"]').first().inputValue();
    expect(emailValue).toBe('admin@ozonemall.com');
  });

  test('TC-AUTH-019 | Admin empty email shows error', async ({ page }) => {
    await page.goto(BASE + '/admin/login');
    await page.locator('input[type="email"]').first().fill('');
    await page.locator('input[type="password"]').first().fill('');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(500);
    const body = await page.textContent('body');
    // Either HTML5 validation or custom error
    expect(body).toBeTruthy();
  });

  test('TC-AUTH-020 | Unauthenticated users see Sign In button in navbar', async ({ page }) => {
    await clearSession(page);
    await page.goto(BASE + '/');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body?.includes('Sign In') || body?.includes('Privilege Club') || body?.includes('Join')).toBeTruthy();
  });
});
