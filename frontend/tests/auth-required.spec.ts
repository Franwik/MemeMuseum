import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:4200');
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

test.describe('Commenting', () => {

  test('should allow logged-in user to add a comment', async ({ page }) => {
    const exploreButton = page.getByRole('button', { name: 'Esplora tutti i meme' })
    await expect(exploreButton).toBeVisible();
    await exploreButton.click();
    
    await expect(page).toHaveURL(/http:\/\/localhost:4200\/explore/);

    // Aspetta che appaia almeno un meme o il messaggio di lista vuota
    const firstMemeCard = page.locator('app-meme-preview').first();
    const noMemeFound = page.getByTestId('no-memes-found');

    await expect(async () => {
      const isCardVisible = await firstMemeCard.isVisible();
      const isNoMemeVisible = await noMemeFound.isVisible();
      expect(isCardVisible !== isNoMemeVisible).toBe(true);
    }).toPass();

    if (await noMemeFound.isVisible()) {
      return;
    }

    // Clicca sul primo meme per andare alla pagina di dettaglio
    await firstMemeCard.click();
    await expect(page).toHaveURL(/http:\/\/localhost:4200\/details\/\d+/);

    // Aggiungi un commento
    const comment = 'test' + Math.random().toString(36);
    const commentInput = page.getByRole('textbox', { name: 'Scrivi un commento...' })
    await expect(commentInput).toBeVisible();
    await commentInput.fill(comment);
    const submitCommentButton = page.getByRole('button', { name: 'Pubblica' })
    await expect(submitCommentButton).toBeVisible();
    await submitCommentButton.click();

    // Attendi il toast di conferma
    const successToast = page.locator('app-toast [class*="border-green"]');
    await expect(successToast).toBeVisible();
    await expect(page.getByText('Commento inviato')).toBeVisible();

    // Verifica che il commento appena aggiunto sia visibile nella lista dei commenti
    const newComment = page.getByText(comment);
    await expect(newComment).toBeVisible();

    // L'URL non deve cambiare
    await expect(page).toHaveURL(/http:\/\/localhost:4200\/details\/\d+/);
  });

});

test.describe('Voting', () => {

  test('should allow logged-in user to upvote if didn\'t already', async ({ page }) => {
    const exploreButton = page.getByRole('button', { name: 'Esplora tutti i meme' })
    await expect(exploreButton).toBeVisible();
    await exploreButton.click();
    
    await expect(page).toHaveURL(/http:\/\/localhost:4200\/explore/);

    // Aspetta che appaia almeno un meme o il messaggio di lista vuota
    const firstMemeCard = page.locator('app-meme-preview').first();
    const noMemeFound = page.getByTestId('no-memes-found');

    await expect(async () => {
      const isCardVisible = await firstMemeCard.isVisible();
      const isNoMemeVisible = await noMemeFound.isVisible();
      expect(isCardVisible !== isNoMemeVisible).toBe(true);
    }).toPass();

    if (await noMemeFound.isVisible()) {
      return;
    }

    // Clicca sul primo meme per andare alla pagina di dettaglio
    await firstMemeCard.click();
    await expect(page).toHaveURL(/http:\/\/localhost:4200\/details\/\d+/);

    // Verifica che la sezione commento per utenti non loggati non mostri mostri il messaggio
    const loginMessage = page.getByText('Effettua il login per votare');
    await expect(loginMessage).toBeHidden();

    const upvoteButton = page.getByTestId('upvoteButton');
    await expect(upvoteButton).toBeVisible();

    if (await upvoteButton.isDisabled()) {
      // L'utente ha già votato
      return;
    }

    // Legge il numero attuale di upvote prima di cliccare
    const upvoteCountLocator = upvoteButton.locator('span.text-green-500');
    const upvoteTextBefore = await upvoteCountLocator.textContent();
    const upvotesBefore = parseInt(upvoteTextBefore?.trim() ?? '0', 10);

    // Clicca sul bottone di voto positivo
    await upvoteButton.click();

    // Attende che il componente ricarichi i dati aggiornati dal server
    await expect(async () => {
      const upvoteTextAfter = await upvoteCountLocator.textContent();
      const upvotesAfter = parseInt(upvoteTextAfter?.trim() ?? '0', 10);
      expect(upvotesAfter).toBe(upvotesBefore + 1);
    }).toPass();

    
    // L'URL non deve cambiare
    await expect(page).toHaveURL(/http:\/\/localhost:4200\/details\/\d+/);
  });

  test('should allow logged-in user to downvote if didn\'t already', async ({ page }) => {
    const exploreButton = page.getByRole('button', { name: 'Esplora tutti i meme' })
    await expect(exploreButton).toBeVisible();
    await exploreButton.click();
    
    await expect(page).toHaveURL(/http:\/\/localhost:4200\/explore/);

    // Aspetta che appaia almeno un meme o il messaggio di lista vuota
    const firstMemeCard = page.locator('app-meme-preview').first();
    const noMemeFound = page.getByTestId('no-memes-found');

    await expect(async () => {
      const isCardVisible = await firstMemeCard.isVisible();
      const isNoMemeVisible = await noMemeFound.isVisible();
      expect(isCardVisible !== isNoMemeVisible).toBe(true);
    }).toPass();

    if (await noMemeFound.isVisible()) {
      return;
    }

    // Clicca sul primo meme per andare alla pagina di dettaglio
    await firstMemeCard.click();
    await expect(page).toHaveURL(/http:\/\/localhost:4200\/details\/\d+/);

    // Verifica che la sezione commento per utenti non loggati non mostri mostri il messaggio
    const loginMessage = page.getByText('Effettua il login per votare');
    await expect(loginMessage).toBeHidden();

    const downButton = page.getByTestId('downvoteButton');
    await expect(downButton).toBeVisible();

    if (await downButton.isDisabled()) {
      // L'utente ha già votato
      return;
    }

    // Legge il numero attuale di upvote prima di cliccare
    const downvoteCountLocator = downButton.locator('span.text-red-500');
    const downvoteTextBefore = await downvoteCountLocator.textContent();
    const downvotesBefore = parseInt(downvoteTextBefore?.trim() ?? '0', 10);

    // Clicca sul bottone di voto negativo
    await downButton.click();

    // Attende che il componente ricarichi i dati aggiornati dal server
    await expect(async () => {
      const downvoteTextAfter = await downvoteCountLocator.textContent();
      const downvotesAfter = parseInt(downvoteTextAfter?.trim() ?? '0', 10);
      expect(downvotesAfter).toBe(downvotesBefore + 1);
    }).toPass();

    
    // L'URL non deve cambiare
    await expect(page).toHaveURL(/http:\/\/localhost:4200\/details\/\d+/);
  });

});