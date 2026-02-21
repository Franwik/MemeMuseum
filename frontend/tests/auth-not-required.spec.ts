import { test, expect } from '@playwright/test';

test.beforeEach('test', async ({ page }) => {
  await page.goto('http://localhost:4200');
});

test.describe('Meme of the day', () => {
  
  test('should display Meme of the Day or no-meme fallback', async ({ page }) => {

    const memeOfTheDay = page.locator('app-meme-card');
    const noMemeMessage = page.getByText('Ancora nulla per oggi!')

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
    }
  });

});

test.describe('Login', () => {

  test('should allow users to log in', async ({ page }) => {
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

test.describe('Commenting', () => {
  test('should not allow non-logged-in user to add a comment', async ({ page }) => {
    
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

    // Verifica che la sezione commento per utenti non loggati mostri il messaggio corretto
    const loginMessage = page.getByText('Accedi per partecipare alla discussione.');
    await expect(loginMessage).toBeVisible();

    // Verifica che il campo commento e il bottone di invio NON siano visibili
    const commentInput = page.getByRole('textbox', { name: 'Scrivi un commento...' })
    const commentSubmitButton = page.getByRole('button', { name: 'Pubblica' })
    await expect(commentInput).not.toBeVisible();
    await expect(commentSubmitButton).not.toBeVisible();
  });
});

test.describe('Voting', () => {

  test('should not allow non-logged-in user to upvote', async ({ page }) => {
    
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

    // Verifica che la sezione commento per utenti non loggati mostri il messaggio corretto
    const loginMessage = page.getByText('Effettua il login per votare');
    await expect(loginMessage).toBeVisible();

    const upvoteButton = page.getByTestId('upvoteButton');
    await expect(upvoteButton).toBeVisible();
    await expect(upvoteButton).toBeDisabled();
  });

  test('should not allow non-logged-in user to downvote', async ({ page }) => {
    
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

    // Verifica che la sezione commento per utenti non loggati mostri il messaggio corretto
    const loginMessage = page.getByText('Effettua il login per votare');
    await expect(loginMessage).toBeVisible();

    // Verifica che il campo commento e il bottone di invio NON siano visibili
    const downvoteButton = page.getByTestId('downvoteButton');
    await expect(downvoteButton).toBeVisible();
    await expect(downvoteButton).toBeDisabled();
  });
});

test.describe('Search', () => {

  test('should allow users to search for memes by title, tag or author', async ({ page }) => {
    const searchQuery = 'iron';
    // Scrivi nella barra di ricerca
    const searchInput = page.getByRole('textbox', { name: 'Cerca meme...' });
    await expect(searchInput).toBeVisible();
    await searchInput.fill(searchQuery);

    // Clicca sul bottone di ricerca
    const searchButton = page.getByRole('button', { name: 'Cerca' })
    await expect(searchButton).toBeVisible();
    await searchButton.click();

    // Verifica che la navigazione verso /search sia avvenuta con il query param corretto
    await expect(page).toHaveURL(new RegExp(`http://localhost:4200/search\\?.*q=${searchQuery}`));

    // Aspetta che la pagina carichi i risultati o il messaggio di nessun risultato
    const firstMemeCard = page.locator('app-meme-preview').first();
    const noResultsMessage = page.getByText('Nessun meme trovato per questa ricerca.');

    await expect(async () => {
      const isCardVisible = await firstMemeCard.isVisible();
      const isNoResultsVisible = await noResultsMessage.isVisible();
      expect(isCardVisible !== isNoResultsVisible).toBe(true);
    }).toPass();

    if (await noResultsMessage.isVisible()) {
      return;
    }

    // Verifica che TUTTI i meme mostrati contengano la stringa cercata
    // nei campi visibili: titolo, autore o tag
    let hasNextPage = false;

    do{

      const cards = page.locator('app-meme-preview');

      for (let i = 0; i < await cards.count(); i++) {
        const card = cards.nth(i);
        const cardText = (await card.innerText()).toLowerCase();
        
        expect(cardText.includes(searchQuery.toLowerCase())).toBe(true);
      }

      const nextButton = page.getByRole('button', { name: 'Successiva' });
      hasNextPage = await nextButton.isEnabled();
      if (hasNextPage) {
        await nextButton.click();
      }
    } while (hasNextPage);
  });

  test('should allow users to search for memes by date', async ({ page }) => {
    
    const searchQuery = '2026-02-18';
    // Scrivi nella barra di ricerca
    const searchDateInput = page.locator('input[name="searchDate"]');
    await expect(searchDateInput).toBeVisible();
    await searchDateInput.fill(searchQuery);
    
    // Clicca sul bottone di ricerca
    const searchButton = page.getByRole('button', { name: 'Cerca' })
    await expect(searchButton).toBeVisible();
    await searchButton.click();

    // Verifica che la navigazione verso /search sia avvenuta con il query param corretto
    await expect(page).toHaveURL(new RegExp(`http://localhost:4200/search\\?.*q=&date=${searchQuery}`));

    // Aspetta che la pagina carichi i risultati o il messaggio di nessun risultato
    const firstMemeCard = page.locator('app-meme-preview').first();
    const noResultsMessage = page.getByText('Nessun meme trovato per questa ricerca.');

    await expect(async () => {
      const isCardVisible = await firstMemeCard.isVisible();
      const isNoResultsVisible = await noResultsMessage.isVisible();
      expect(isCardVisible !== isNoResultsVisible).toBe(true);
    }).toPass();

    if (await noResultsMessage.isVisible()) {
      return;
    }

    // Verifica che TUTTI i meme mostrati contengano la stringa cercata
    // nei campi visibili: titolo, autore o tag
    let hasNextPage = false;

    do{

      const cards = page.locator('app-meme-preview');

      for (let i = 0; i < await cards.count(); i++) {
        const card = cards.nth(i);
        const cardText = (await card.innerText()).toLowerCase();

        // Estrapola la data dal testo della card (assumendo che sia nel formato DD/MM/YYYY)
        const dateMatch = cardText.match(/\d{2}\/\d{2}\/\d{4}/);
        const cardDate = dateMatch ? dateMatch[0] : '';
        const formattedSearchDate = `${searchQuery.split('-')[2]}/${searchQuery.split('-')[1]}/${searchQuery.split('-')[0]}`;
        
        expect(cardDate).toBe(formattedSearchDate);
      }

      const nextButton = page.getByRole('button', { name: 'Successiva' });
      hasNextPage = await nextButton.isEnabled();
      if (hasNextPage) {
        await nextButton.click();
      }
    } while (hasNextPage);

  });

});