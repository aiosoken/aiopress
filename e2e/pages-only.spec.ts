import { test, expect, Page } from '@playwright/test';

/**
 * 既存アカウントでログインし、各ページのスクリーンショットを取得するテスト
 * （生成テストとは独立して実行可能）
 */

const SS_DIR = 'e2e/screenshots';

// 直前のfull-flow.specで作成したアカウントのメールを探す
// → full-flowの後に実行する場合、既にログイン済みのセッションを使う

async function screenshot(page: Page, name: string) {
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SS_DIR}/${name}.png`, fullPage: true });
}

async function waitForPage(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
}

async function selectBrand(page: Page) {
  const selects = page.locator('[role="combobox"]');
  const count = await selects.count();
  for (let i = 0; i < count; i++) {
    const sel = selects.nth(i);
    const text = await sel.textContent();
    if (text?.includes('ブランドを選択') || text?.includes('選択')) {
      await sel.click();
      await page.waitForTimeout(500);
      const option = page.locator('[role="option"]').first();
      if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
        await option.click();
        await page.waitForTimeout(2000);
        return;
      }
    }
  }
}

test.describe('ページ表示確認', () => {
  test('ランディングページ', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await waitForPage(page);
    await screenshot(page, 'page_landing');
  });

  test('ログインページ', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await waitForPage(page);
    await screenshot(page, 'page_login');
  });

  test('登録ページ', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'networkidle' });
    await waitForPage(page);
    await screenshot(page, 'page_register');
  });
});
