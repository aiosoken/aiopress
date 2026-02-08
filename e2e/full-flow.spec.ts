import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = `e2e-test-${Date.now()}@aiopress.test`;
const TEST_PASSWORD = 'Test1234!';
const TEST_NAME = 'E2Eテストユーザー';
const BRAND_NAME = 'テストブランド株式会社';
const BRAND_DESC = 'E2Eテスト用のサンプルブランドです。AIクリエイティブ生成プラットフォームの検証に使用します。';

const SS_DIR = 'e2e/screenshots';

async function screenshot(page: Page, name: string) {
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SS_DIR}/${name}.png`, fullPage: true });
}

async function waitForPage(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
}

/** ページ内の「ブランドを選択」セレクトボックスからブランドを選ぶ */
async function selectBrand(page: Page) {
  // まずSelectトリガー（combobox）を探す
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
        return true;
      }
    }
  }
  return false;
}

test.describe.serial('AIOPress E2E フルフロー', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  // ============================================
  // 1. ランディングページ
  // ============================================
  test('01 - ランディングページ表示', async () => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForPage(page);
    await expect(page.locator('header').getByText('AIOプレス')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h1')).toContainText('ブランドDNA');
    await screenshot(page, '01_landing');
  });

  // ============================================
  // 2. 新規登録
  // ============================================
  test('02 - テストアカウント新規登録', async () => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' });
    await waitForPage(page);
    await expect(page.getByText('新規登録')).toBeVisible({ timeout: 10000 });
    await screenshot(page, '02_register_form');

    await page.getByLabel('お名前').fill(TEST_NAME);
    await page.getByLabel('メールアドレス').fill(TEST_EMAIL);
    await page.getByLabel('パスワード', { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel('パスワード（確認）').fill(TEST_PASSWORD);
    await screenshot(page, '02_register_filled');

    await page.getByRole('button', { name: 'アカウント作成' }).click();
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    await waitForPage(page);
    await screenshot(page, '02_register_success');
  });

  // ============================================
  // 3. ダッシュボード
  // ============================================
  test('03 - ダッシュボード表示', async () => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await waitForPage(page);
    await expect(page.getByText('ダッシュボード').first()).toBeVisible({ timeout: 10000 });
    await screenshot(page, '03_dashboard');
  });

  // ============================================
  // 4. ブランド作成
  // ============================================
  test('04 - ブランド作成', async () => {
    await page.goto('/brands', { waitUntil: 'domcontentloaded' });
    await waitForPage(page);
    await screenshot(page, '04_brands_empty');

    const createBtn = page.getByRole('button', { name: '新規ブランド作成' });
    const emptyBtn = page.getByRole('button', { name: '最初のブランドを作成' });

    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click();
    } else if (await emptyBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emptyBtn.click();
    }
    await page.waitForTimeout(500);

    await page.getByLabel('ブランド名').fill(BRAND_NAME);
    const descInput = page.getByLabel('説明');
    if (await descInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await descInput.fill(BRAND_DESC);
    }
    await screenshot(page, '04_brand_create_dialog');

    await page.getByRole('button', { name: '作成' }).click();
    await page.waitForTimeout(5000);
    await screenshot(page, '04_brand_created');
  });

  // ============================================
  // 5. ブランドDNA設定
  // ============================================
  test('05 - ブランドDNA設定', async () => {
    await page.goto('/design-system', { waitUntil: 'domcontentloaded' });
    await waitForPage(page);
    await screenshot(page, '05_design_system_initial');

    // ブランドを選択
    await selectBrand(page);
    await screenshot(page, '05_brand_selected');

    // ブランドDNAタブ - textareaにサンプルデータ入力
    const textareas = page.locator('textarea');
    const count = await textareas.count();

    const dnaValues = [
      'テクノロジーの力で、すべてのクリエイターの創造性を解放する',
      '世界中のブランドがAIと共創する未来を実現する',
      'Brand DNAに基づいた一貫性のあるAIクリエイティブを、誰でも簡単に生成できる',
      '革新的でありながら親しみやすい、プロフェッショナルなパートナー',
      '明るく前向きで、専門性を感じさせつつもカジュアルなトーン',
      '中小企業のマーケティング担当者、フリーランスデザイナー、スタートアップ経営者',
    ];

    for (let i = 0; i < Math.min(count, dnaValues.length); i++) {
      const textarea = textareas.nth(i);
      if (await textarea.isVisible({ timeout: 1000 }).catch(() => false)) {
        await textarea.fill(dnaValues[i]);
      }
    }

    // キーワード追加
    const keywordInput = page.getByPlaceholder('キーワードを入力');
    if (await keywordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      for (const kw of ['AIクリエイティブ', 'ブランドDNA', '自動生成', 'マーケティング']) {
        await keywordInput.fill(kw);
        await page.getByRole('button', { name: '追加' }).first().click();
        await page.waitForTimeout(300);
      }
    }

    // ブランドバリュー追加
    const valueInput = page.getByPlaceholder('ブランドバリューを入力');
    if (await valueInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      for (const v of ['イノベーション', '一貫性', 'アクセシビリティ']) {
        await valueInput.fill(v);
        await page.getByRole('button', { name: '追加' }).last().click();
        await page.waitForTimeout(300);
      }
    }
    await screenshot(page, '05_brand_dna_filled');

    // デザインシステムタブ
    const dsTab = page.getByRole('tab', { name: 'デザインシステム' });
    if (await dsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dsTab.click();
      await page.waitForTimeout(1000);
      await screenshot(page, '05_design_system_colors');
    }

    // 保存
    const saveBtn = page.getByRole('button', { name: '保存' });
    if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      try {
        await saveBtn.click({ timeout: 10000 });
        await page.waitForTimeout(5000);
        await screenshot(page, '05_design_system_saved');
      } catch {
        await screenshot(page, '05_design_system_save_skipped');
      }
    }
  });

  // ============================================
  // 5b. URLからブランド情報自動抽出
  // ============================================
  test('05b - URLからブランド情報自動抽出', async () => {
    await page.goto('/design-system', { waitUntil: 'domcontentloaded' });
    await waitForPage(page);

    // ブランドを選択
    await selectBrand(page);

    // 「自動抽出」ボタンをクリック
    const extractBtn = page.getByRole('button', { name: '自動抽出' });
    await expect(extractBtn).toBeEnabled({ timeout: 5000 });
    await extractBtn.click();
    await page.waitForTimeout(1000);
    await screenshot(page, '05b_extraction_dialog');

    // ダイアログ内の「URL」タブに切り替え
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 3000 });
    const urlTab = dialog.getByRole('tab', { name: 'URL' });
    if (await urlTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await urlTab.click();
      await page.waitForTimeout(500);
    }

    // URLを入力
    const urlInput = dialog.locator('input[type="url"]');
    await urlInput.fill('https://www.anthropic.com');
    await screenshot(page, '05b_url_input');

    // 「抽出する」ボタンをクリック
    const submitBtn = dialog.getByRole('button', { name: '抽出する' });
    await submitBtn.click();

    // Cloud Function の応答を待つ（最大60秒）
    await screenshot(page, '05b_extracting');

    // 「分析中...」が消えるまで待つ or 結果が表示されるまで待つ
    const resultTitle = dialog.getByText('抽出結果');
    const errorText = dialog.getByText('抽出できませんでした');
    try {
      await resultTitle.waitFor({ timeout: 60000 });
      await page.waitForTimeout(1000);
      await screenshot(page, '05b_extraction_result');

      // 「適用する」ボタンをクリック
      const applyBtn = dialog.getByRole('button', { name: '適用する' });
      if (await applyBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await applyBtn.click();
        await page.waitForTimeout(3000);
        await screenshot(page, '05b_applied');
      }
    } catch {
      // エラーの場合もスクリーンショットを取る
      if (await errorText.isVisible({ timeout: 2000 }).catch(() => false)) {
        await screenshot(page, '05b_extraction_error');
      } else {
        await screenshot(page, '05b_extraction_timeout');
      }
      // ダイアログを閉じる
      const closeBtn = dialog.locator('button[aria-label="Close"]').or(dialog.getByRole('button', { name: 'Close' }));
      if (await closeBtn.first().isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeBtn.first().click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(500);
    }
  });

  // ============================================
  // 6. アセットページ
  // ============================================
  test('06 - アセットページ表示', async () => {
    await page.goto('/assets', { waitUntil: 'domcontentloaded' });
    await waitForPage(page);
    await screenshot(page, '06_assets');
  });

  // ============================================
  // 7. クリエイティブ生成（キャッチコピー）
  // ============================================
  test('07 - クリエイティブ生成（キャッチコピー）', async () => {
    await page.goto('/creatives', { waitUntil: 'domcontentloaded' });
    await waitForPage(page);

    // ブランドを選択
    await selectBrand(page);
    await screenshot(page, '07_creatives_brand_selected');

    // 新規生成ボタン
    const genBtn = page.getByRole('button', { name: '新規生成' });
    try {
      await genBtn.click({ timeout: 10000 });
    } catch {
      // ボタンがdisabledなら空状態のボタンを試す
      const emptyBtn = page.getByRole('button', { name: '最初のクリエイティブを生成' });
      if (await emptyBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await emptyBtn.click();
      }
    }
    await page.waitForTimeout(1000);
    await screenshot(page, '07_creative_dialog');

    // キャッチコピー生成
    const instructionField = page.locator('#instruction');
    if (await instructionField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await instructionField.fill('AIの力で誰でもプロ級のクリエイティブが作れるサービスの魅力を伝えるキャッチコピー');
      await screenshot(page, '07_creative_instruction');

      await page.getByRole('button', { name: '生成' }).click();
      // Cloud Functionsの応答を待つ
      await page.waitForTimeout(45000);
      await screenshot(page, '07_creative_result');
    }
  });

  // ============================================
  // 8. クリエイティブ生成（SNS投稿）
  // ============================================
  test('08 - クリエイティブ生成（SNS投稿）', async () => {
    await page.goto('/creatives', { waitUntil: 'domcontentloaded' });
    await waitForPage(page);
    await selectBrand(page);

    const genBtn = page.getByRole('button', { name: '新規生成' });
    try { await genBtn.click({ timeout: 10000 }); } catch { /* skip */ }
    await page.waitForTimeout(1000);

    // SNS投稿タイプを選択（ダイアログ内の最初のcombobox）
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.isVisible({ timeout: 3000 }).catch(() => false)) {
      const typeSelect = dialog.locator('[role="combobox"]').first();
      if (await typeSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await typeSelect.click();
        await page.waitForTimeout(500);
        const snsOption = page.locator('[role="option"]').filter({ hasText: 'SNS投稿' });
        if (await snsOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await snsOption.click();
          await page.waitForTimeout(500);
        }
      }
    }

    const instructionField = page.locator('#instruction');
    if (await instructionField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await instructionField.fill('新機能リリースのお知らせ。AIがブランドDNAを学習して一貫性のあるクリエイティブを自動生成');
      await screenshot(page, '08_sns_instruction');

      await page.getByRole('button', { name: '生成' }).click();
      await page.waitForTimeout(45000);
      await screenshot(page, '08_sns_result');
    }
  });

  // ============================================
  // 9. クリエイティブ生成（画像）
  // ============================================
  test('09 - クリエイティブ生成（画像）', { timeout: 180000 }, async () => {
    await page.goto('/creatives', { waitUntil: 'domcontentloaded' });
    await waitForPage(page);
    await selectBrand(page);

    const genBtn = page.getByRole('button', { name: '新規生成' });
    try { await genBtn.click({ timeout: 10000 }); } catch { /* skip */ }
    await page.waitForTimeout(1000);

    // 画像タイプを選択
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.isVisible({ timeout: 3000 }).catch(() => false)) {
      const typeSelect = dialog.locator('[role="combobox"]').first();
      if (await typeSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await typeSelect.click();
        await page.waitForTimeout(500);
        const imageOption = page.locator('[role="option"]').filter({ hasText: '画像' });
        if (await imageOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await imageOption.click();
          await page.waitForTimeout(500);
        }
      }
    }

    const instructionField = page.locator('#instruction');
    if (await instructionField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await instructionField.fill('モダンなテクノロジー企業のブランドイメージ。青と白を基調とした洗練されたデザイン');
      await screenshot(page, '09_image_instruction');

      await page.getByRole('button', { name: '生成' }).click();
      await page.waitForTimeout(90000);
      await screenshot(page, '09_image_result');
    }
  });

  // ============================================
  // 10. クリエイティブ一覧
  // ============================================
  test('10 - クリエイティブ一覧', async () => {
    await page.goto('/creatives', { waitUntil: 'domcontentloaded' });
    await waitForPage(page);
    await selectBrand(page);
    await screenshot(page, '10_creatives_list');

    for (const tab of ['キャッチコピー', 'SNS投稿', '画像', 'すべて']) {
      const tabEl = page.getByRole('tab', { name: tab });
      if (await tabEl.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tabEl.click();
        await page.waitForTimeout(500);
        await screenshot(page, `10_tab_${tab}`);
      }
    }
  });

  // ============================================
  // 11. アナリティクス
  // ============================================
  test('11 - アナリティクス', async () => {
    await page.goto('/analytics', { waitUntil: 'domcontentloaded' });
    await waitForPage(page);
    await screenshot(page, '11_analytics');
  });

  // ============================================
  // 12. ブランド詳細
  // ============================================
  test('12 - ブランド詳細', async () => {
    await page.goto('/brands', { waitUntil: 'domcontentloaded' });
    await waitForPage(page);

    const detailLink = page.getByRole('link', { name: '詳細を見る' }).first();
    if (await detailLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await detailLink.click();
      await waitForPage(page);
      await screenshot(page, '12_brand_detail_overview');

      for (const tab of ['資産', 'デザインシステム', 'クリエイティブ', 'メンバー']) {
        const tabEl = page.getByRole('tab', { name: tab });
        if (await tabEl.isVisible({ timeout: 2000 }).catch(() => false)) {
          await tabEl.click();
          await page.waitForTimeout(500);
          await screenshot(page, `12_brand_${tab}`);
        }
      }
    }
  });

  // ============================================
  // 13. 設定
  // ============================================
  test('13 - 設定', async () => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await waitForPage(page);
    await screenshot(page, '13_settings');
  });

  // ============================================
  // 14. ダッシュボード最終
  // ============================================
  test('14 - ダッシュボード最終確認', async () => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await waitForPage(page);
    await screenshot(page, '14_dashboard_final');
  });
});
