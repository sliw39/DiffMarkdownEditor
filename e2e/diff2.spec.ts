import { test, expect } from '@playwright/test';

async function acceptFirstDiffInEditor(page: import('@playwright/test').Page) {
  const wrap = page.locator('.dm-milkdown-host .diff-change-wrap').first();
  await wrap.hover();
  await page.locator('.dm-milkdown-host').getByRole('button', { name: 'Accept' }).first().click();
}

test.describe('Diff functionality extended', () => {
  test('should replace all "Item" with "Element"', async ({ page }) => {
    await page.goto('/');

    // Wait for the editor to load the initial content completely
    const editor = page.locator('.dm-milkdown-host');
    await expect(editor).toContainText('Item 3');

    const originalTextInput = page.locator('div.form-group').filter({ hasText: 'Original Text' }).locator('input');
    await originalTextInput.fill('Item');

    const newTextInput = page.locator('div.form-group').filter({ hasText: 'New Text' }).locator('input');
    await newTextInput.fill('Element');

    const simulateButton = page.getByRole('button', { name: 'Simulate AI Replace' });
    await simulateButton.click();

    await expect(page.locator('.dm-milkdown-host .diff-change-wrap').first()).toBeVisible();

    const count = await page.locator('.dm-milkdown-host .diff-change-wrap').count();
    for (let i = 0; i < count; ++i) {
      await acceptFirstDiffInEditor(page);
    }

    await expect(editor).toContainText('Element 1');
    await expect(editor).toContainText('Element 2');
    await expect(editor).toContainText('Element 3');
    await expect(editor).not.toContainText('Item');
  });

  test('should delete a full paragraph', async ({ page }) => {
    await page.goto('/');

    const editor = page.locator('.dm-milkdown-host');
    await expect(editor).toContainText('This is a blockquote');

    const originalTextInput = page.locator('div.form-group').filter({ hasText: 'Original Text' }).locator('input');
    await originalTextInput.fill("This is a blockquote. It's useful for calling out specific text.");

    const newTextInput = page.locator('div.form-group').filter({ hasText: 'New Text' }).locator('input');
    await newTextInput.fill('');

    const simulateButton = page.getByRole('button', { name: 'Simulate AI Replace' });
    await simulateButton.click();

    await expect(page.locator('.dm-milkdown-host .diff-change-wrap').first()).toBeVisible();

    const count = await page.locator('.dm-milkdown-host .diff-change-wrap').count();
    for (let i = 0; i < count; ++i) {
      await acceptFirstDiffInEditor(page);
    }

    await expect(editor).not.toContainText("This is a blockquote. It's useful for calling out specific text.");
  });
});
