import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { map, catchError, of } from 'rxjs';

/**
 * Guard per proteggere le route che richiedono autenticazione
 * Verifica con il backend se il cookie è valido
 * 
 * Uso nelle route:
 * {
 *   path: 'profile',
 *   component: ProfileComponent,
 *   canActivate: [authGuard]
 * }
 */
export const authGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica asincrona con il server
  return authService.isAuthenticatedAsync().pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }

      // Non autenticato - salva l'URL richiesto e reindirizza al login
      router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }),
    catchError(() => {
      // Errore durante la verifica - reindirizza al login
      router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return of(false);
    })
  );
};

/**
 * Guard per reindirizzare gli utenti già autenticati
 * Utile per login/register: se sei già loggato, vai alla home
 * 
 * Uso nelle route:
 * {
 *   path: 'login',
 *   component: LoginComponent,
 *   canActivate: [guestGuard]
 * }
 */
export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticatedAsync().pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        // Già autenticato - vai alla home
        router.navigate(['/']);
        return false;
      }
      // Non autenticato - può accedere
      return true;
    }),
    catchError(() => {
      // Errore - permetti l'accesso
      return of(true);
    })
  );
};