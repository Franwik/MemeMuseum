import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of, map } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Inizializza con null - il token è nei cookies, non accessibile da JS
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
    
    // Verifica se c'è un utente autenticato all'avvio dell'app
    this.checkAuthStatus();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verifica lo stato di autenticazione chiamando il backend
   * Il backend leggerà il cookie e verificherà il token
   */
  private checkAuthStatus(): void {
    this.verifyToken().subscribe({
      next: (response) => {
        if (response && response.user) {
          this.currentUserSubject.next(response.user);
        }
      },
      error: () => {
        // Token non valido o assente, utente non autenticato
        this.currentUserSubject.next(null);
      }
    });
  }

  /**
   * Verifica se il token nel cookie è ancora valido
   */
  verifyToken(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/verify`, {
      withCredentials: true // IMPORTANTE: invia i cookies nelle richieste
    });
  }

  /**
   * Registrazione nuovo utente
   * Il backend imposterà automaticamente il cookie con il token
   */
  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
      username,
      email,
      password
    }, {
      withCredentials: true // IMPORTANTE: permette di ricevere i cookies dal backend
    }).pipe(
      tap(response => {
        // Salva l'utente nello stato dell'app
        if (response.user) {
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  /**
   * Login utente con email
   * Il backend imposterà il cookie con il token
   */
  login(email: string, password: string, rememberMe: boolean = false): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email,
      password,
      rememberMe
    }, {
      withCredentials: true // IMPORTANTE: permette di ricevere i cookies dal backend
    }).pipe(
      tap(response => {
        // Salva l'utente nello stato dell'app
        if (response.user) {
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  /**
   * Logout utente
   * Il backend rimuoverà il cookie
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        // Rimuovi l'utente dallo stato dell'app
        this.currentUserSubject.next(null);
        // Reindirizza alla home
      }),
      catchError((error) => {
        // Anche in caso di errore, pulisci lo stato locale
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  /**
   * Logout sincrono (senza chiamata al backend)
   * Utile in caso di errori o per logout rapido
   */
  logoutLocal(): void {
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  /**
   * Rinnova il token prima della scadenza
   */
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}, {
      withCredentials: true
    }).pipe(
      tap(response => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  /**
   * Verifica se l'utente è autenticato
   * Controlla solo lo stato locale - per verificare con il server usa verifyToken()
   */
  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  /**
   * Verifica se l'utente è autenticato controllando con il server
   * Restituisce un Observable per uso asincrono (es. nei guards)
   */
  isAuthenticatedAsync(): Observable<boolean> {
    return this.verifyToken().pipe(
      map(response => {
        if (response && response.user) {
          this.currentUserSubject.next(response.user);
          return true;
        }
        return false;
      }),
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(false);
      })
    );
  }
}