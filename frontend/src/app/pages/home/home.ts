import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MemeCardComponent } from '../../components/meme-card/meme-card';
import { MemeService } from '../../_services/meme';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MemeCardComponent],
  templateUrl: './home.html'
})
export class HomeComponent implements OnInit {
  searchQuery: string = '';

  // Meme del giorno
  dailyMeme: MemeCardComponent | null = null;

  constructor(
    private router: Router,
    private memeService: MemeService
  ) {}

  loadDailyMeme(): void {
    console.log('Inizio caricamento meme del giorno...');
    this.memeService.getMemeOfTheDay().subscribe({
      next: (meme) => {
        console.log('Meme ricevuto:', meme);
        this.dailyMeme = {
          imagePath: meme.immagine,
          title: meme.titolo,
          author: meme.autore.username,
          upvotes: meme.upvotes,
          downvotes: meme.downvotes,
          isDaily: true
        };
        console.log('dailyMeme aggiornato:', this.dailyMeme);
      },
      error: (err) => {
        console.error('Errore nel caricamento del meme del giorno:', err);
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Ricerca:', this.searchQuery);
      // Qui puoi navigare alla pagina di ricerca quando la implementerai
      // this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }
  
  ngOnInit(): void {
    this.loadDailyMeme();
  }
}