import { expect, test } from '@playwright/test';

test('home page renders Cafetulia title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Cafetulia' })).toBeVisible();
});
