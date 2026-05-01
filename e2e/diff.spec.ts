import { test, expect } from '@playwright/test';

async function openDiffTooltip(page: import('@playwright/test').Page) {
  const diffWrap = page.locator('.dm-milkdown-host .diff-change-wrap').first();
  await expect(diffWrap).toBeVisible();
  await diffWrap.hover();
  const tooltip = page.locator('.dm-milkdown-host .diff-tooltip');
  await expect(tooltip).toBeVisible();
}

test.describe('Diff functionality', () => {
  test('should simulate diff and accept it', async ({ page }) => {
    await page.goto('/');

    // The default original text input value is 'test the editor',
    // but the actual text in the editor is 'test document'.
    // We update the Original Text input to 'test document'.
    const originalTextInput = page.locator('div.form-group').filter({ hasText: 'Original Text' }).locator('input');
    await originalTextInput.fill('test document');

    const newTextInput = page.locator('div.form-group').filter({ hasText: 'New Text' }).locator('input');
    await newTextInput.fill('demonstrate the diff functionality');

    const simulateButton = page.getByRole('button', { name: 'Simulate AI Replace' });
    await simulateButton.click();

    await openDiffTooltip(page);
    const tooltip = page.locator('.dm-milkdown-host .diff-tooltip');
    await expect(tooltip).toContainText('test document');
    await expect(tooltip).toContainText('demonstrate the diff functionality');

    const acceptButton = page.locator('.dm-milkdown-host').getByRole('button', { name: 'Accept' });
    await acceptButton.click();

    await expect(page.locator('.dm-milkdown-host .diff-change-wrap')).toHaveCount(0);

    const editor = page.locator('.dm-milkdown-host');
    await expect(editor).toContainText('demonstrate the diff functionality');
    await expect(editor).not.toContainText('test document');
  });

  test('should simulate diff and discard it', async ({ page }) => {
    await page.goto('/');

    const originalTextInput = page.locator('div.form-group').filter({ hasText: 'Original Text' }).locator('input');
    await originalTextInput.fill('test document');

    const newTextInput = page.locator('div.form-group').filter({ hasText: 'New Text' }).locator('input');
    await newTextInput.fill('demonstrate the diff functionality');

    const simulateButton = page.getByRole('button', { name: 'Simulate AI Replace' });
    await simulateButton.click();

    await openDiffTooltip(page);

    const discardButton = page.locator('.dm-milkdown-host').getByRole('button', { name: 'Discard' });
    await discardButton.click();

    await expect(page.locator('.dm-milkdown-host .diff-change-wrap')).toHaveCount(0);

    const editor = page.locator('.dm-milkdown-host');
    await expect(editor).not.toContainText('demonstrate the diff functionality');
    await expect(editor).toContainText('test document');
  });
});
