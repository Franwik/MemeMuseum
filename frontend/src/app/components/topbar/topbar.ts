import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../_services/auth.service';
import { Observable } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.html',
  animations: [
    trigger('mobileMenuAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class TopbarComponent implements OnInit {
  currentUser$: Observable<User | null>;
  mobileMenuOpen = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.currentUser$ = this.authService.currentUser;
  }

  onHome() {
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    document.documentElement.classList.add('dark');
  }

  onLogin(): void {
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: this.router.url } 
    });
  }

  onRegister(): void {
    this.router.navigate(['/register'], { 
      queryParams: { returnUrl: this.router.url } 
    });
  }

  onLogout(): void {
    this.authService.logout().subscribe(() => {
      // Ricarica la pagina corrente
      window.location.reload();
    });
  }

  // Naviga alla pagina di creazione meme
  onCreateMeme(): void {
    this.router.navigate(['/create']);
  }

  // Naviga alla pagina con tutti i meme (ricerca senza query)
  onExplore(): void {
    this.router.navigate(['/explore']);
  }

  // Toggle mobile menu
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
  
}