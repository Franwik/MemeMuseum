import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html'
})

export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showPassword = false;
  returnUrl: string = '/';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Se l'utente è già loggato, reindirizza alla home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return;
    }

    this.initializeForm();

    // Ottieni l'URL di ritorno dai query params (se presente)
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required
      ]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // Reset messaggi
    this.errorMessage = null;
    this.successMessage = null;

    // Verifica validità form
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login(email, password, rememberMe).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Login effettuato con successo!';
        
        // Se "Ricordami" è selezionato, salva un flag nel localStorage
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }
        
        // Reindirizza dopo 1 secondo
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        
        // Gestisci diversi tipi di errore
        if (error.status === 401) {
          this.errorMessage = 'Email o password non corretti';
        } else if (error.status === 404) {
          this.errorMessage = 'Account non trovato';
        } else if (error.status === 403) {
          this.errorMessage = 'Account disabilitato o non verificato';
        } else if (error.status === 0) {
          this.errorMessage = 'Impossibile contattare il server. Riprova più tardi';
        } else {
          this.errorMessage = error.error?.message || 'Errore durante l\'accesso. Riprova';
        }
      }
    });
  }

  // Metodo helper per marcare tutti i campi come touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getter per accesso facile ai form controls nel template
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get rememberMe() {
    return this.loginForm.get('rememberMe');
  }
}