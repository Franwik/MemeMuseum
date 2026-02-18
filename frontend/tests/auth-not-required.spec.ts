import { test, expect } from '@playwright/test';

test.beforeEach('test', async ({ page }) => {
  await page.goto('http://localhost:4200');
});

test.describe('Meme of the day', () => {
  
  test('should display Meme of the Day or no-meme fallback', async ({ page }) => {

    const memeOfTheDay = page.locator('app-meme-card');
    const noMemeMessage = page.locator('div').filter({ hasText: 'Ancora nulla per oggi!' });

    await expect(memeOfTheDay.or(noMemeMessage)).toBeVisible();
    const hasMeme = await memeOfTheDay.isVisible();

    if (hasMeme) {
      await memeOfTheDay.click();
      await expect(page).toHaveURL(/http:\/\/localhost:4200\/details\/[^\/]+/);

      const memeImage = page.locator('img[alt]').first();
      await expect(memeImage).toBeVisible();
      await expect(memeImage).toHaveAttribute('src');
      await expect(memeImage).not.toHaveAttribute('src', '');

      const commentsList = page.locator('div.space-y-3');
      await expect(commentsList).toBeVisible();

      const commentsTitle = page.locator('h2').filter({ hasText: 'Commenti' });
      await expect(commentsTitle).toHaveText(/Commenti/);

    } else {
      await expect(page.getByText('Nessun commento ancora. Sii il primo a commentare!')).toBeVisible();
    }
  });

});