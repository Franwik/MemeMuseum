import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MemeCardComponent } from '../../components/meme-card/meme-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MemeCardComponent],
  templateUrl: './home.html'
})
export class HomeComponent {
  searchQuery: string = '';

  // Meme del giorno (esempio)
  dailyMeme = {
    imageUrl: 'https://via.placeholder.com/600x600?text=Daily+Meme',
    title: 'Il Meme Più Divertente del Giorno',
    author: 'MemeKing',
    upvotes: 1337,
    downvotes: 42,
    isDaily: true
  };

  constructor(private router: Router) {}

  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Ricerca:', this.searchQuery);
      // Qui puoi navigare alla pagina di ricerca quando la implementerai
      // this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }
}