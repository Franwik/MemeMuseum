import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { ToastService } from '../../_services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html'
})

export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  returnUrl: string = '/';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastService: ToastService
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
    // Verifica validità form
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login(email, password, rememberMe).subscribe({
      next: (response) => {

        // Se "Ricordami" è selezionato, salva un flag nel localStorage
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }

        this.toastService.success('Accesso effettuato', 'Bentornato!');

        // Reindirizzamento all'URL di ritorno o alla home
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        // Gestisci diversi tipi di errore
        let message: string;

        if (error.status === 401) {
          message = 'Email o password non corretti';
          console.log('Tentativo di login fallito per email:', email);
        } else if (error.status === 404) {
          message = 'Account non trovato';
        } else if (error.status === 403) {
          message = 'Account disabilitato o non verificato';
        } else if (error.status === 0) {
          message = 'Impossibile contattare il server. Riprova più tardi';
        } else {
          message = error.error?.message || 'Errore durante l\'accesso. Riprova';
        }

        this.toastService.error('Accesso fallito', message);
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