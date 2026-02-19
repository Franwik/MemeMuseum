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

test.describe('Login', () => {

  test('should allow users to log in', async ({ page }) => {
    await page.goto('http://localhost:4200');

    // Il bottone di login nella navbar (adatta il selettore alla tua navbar)
    const loginButton = page.getByRole('button', { name: 'Accedi' })
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    await expect(page).toHaveURL(/http:\/\/localhost:4200\/login/);

    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');

    await emailInput.fill('test@mail.com');
    await passwordInput.fill('testss');

    const submitButton = page.getByRole('main').getByRole('button', { name: 'Accedi' })
    await submitButton.click();

    const toastContainer = page.locator('app-toast');
    await expect(toastContainer.locator('[class*="border-green"]')).toBeVisible();
    await expect(page.getByText('Bentornato!')).toBeVisible();
  });

  test('should block users from logging in with incorrect credentials', async ({ page }) => {
    await page.goto('http://localhost:4200');

    // Il bottone di login nella navbar (adatta il selettore alla tua navbar)
    const loginButton = page.getByRole('button', { name: 'Accedi' })
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    await expect(page).toHaveURL(/http:\/\/localhost:4200\/login/);

    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');

    await emailInput.fill('wrong@example.com');
    await passwordInput.fill('wrongpassword');

    const submitButton = page.getByRole('main').getByRole('button', { name: 'Accedi' })
    await submitButton.click();

    // Attendi il toast di errore
    const errorToast = page.locator('app-toast [class*="border-red"]');
    await expect(errorToast).toBeVisible();
    await expect(page.getByText('Accesso fallito')).toBeVisible();
    await expect(page.getByText('Email o password non corretti')).toBeVisible();

    // L'URL non deve cambiare
    await expect(page).toHaveURL(/http:\/\/localhost:4200\/login/);
  });

});