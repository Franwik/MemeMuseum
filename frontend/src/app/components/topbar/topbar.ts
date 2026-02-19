import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../_services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.html'
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