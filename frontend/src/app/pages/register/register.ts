import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { ToastService } from '../../_services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html'
})

export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
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
    this.initializeForm();

    // Ottieni l'URL di ritorno dai query params (se presente)
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_-]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    const { username, email, password } = this.registerForm.value;

    this.authService.register(username, email, password).subscribe({
      next: (response) => {
        // Feedback di successo tramite Toast
        this.toastService.success(
          'Registrazione completata!', 
          'Il tuo account è stato creato.'
        );

        // Reindirizzamento all'URL di ritorno o alla home
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        // Gestione errori specifica per i Toast
        let message: string;
        
        if (error.status === 409) {
          message = 'Username o email già in uso';
        } else if (error.status === 400) {
          message = 'Dati non validi. Controlla i campi inseriti';
        } else if (error.status === 0) {
          message = 'Impossibile contattare il server';
        } else {
          message = error.error?.message || 'Errore durante la registrazione';
        }

        this.toastService.error('Registrazione fallita', message);
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters
  get username() { return this.registerForm.get('username'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
}