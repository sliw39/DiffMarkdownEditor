import { test, expect } from '@playwright/test';

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

    // Verify diff appears
    const diffPreview = page.locator('.diff-preview');
    await expect(diffPreview).toBeVisible();
    await expect(diffPreview).toContainText('test document');
    await expect(diffPreview).toContainText('demonstrate the diff functionality');

    // Accept diff
    const acceptButton = page.getByRole('button', { name: 'Accept' });
    await acceptButton.click();

    // Verify diff is gone
    await expect(diffPreview).not.toBeVisible();

    // Verify the text is updated in the editor
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

    // Verify diff appears
    const diffPreview = page.locator('.diff-preview');
    await expect(diffPreview).toBeVisible();

    // Discard diff
    const discardButton = page.getByRole('button', { name: 'Discard' });
    await discardButton.click();

    // Verify diff is gone
    await expect(diffPreview).not.toBeVisible();

    // Verify the text is NOT updated in the editor
    const editor = page.locator('.dm-milkdown-host');
    await expect(editor).not.toContainText('demonstrate the diff functionality');
    await expect(editor).toContainText('test document');
  });
});
