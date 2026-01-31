import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.html'
})

export class TopbarComponent implements OnInit {

  constructor(
    private router: Router
  ) {}

  onHome() {
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    // Imposta il tema scuro fisso
    document.documentElement.classList.add('dark');
  }

  onLogin(): void {
    console.log('Login clicked');
    // Aggiungi qui la logica per il login
  }

  onRegister(): void {
    console.log('Register clicked');
    // Aggiungi qui la logica per la registrazione
  }
}