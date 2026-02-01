import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MemeCardComponent } from '../../components/meme-card/meme-card';
import { MemeService } from '../../_services/meme';
import { SearchBarComponent } from '../../components/search-bar/search-bar';

// Interfaccia per i dati del meme
interface MemeData {
  imagePath: string;
  title: string;
  author: string;
  upvotes: number;
  downvotes: number;
  isDaily: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MemeCardComponent, SearchBarComponent],
  templateUrl: './home.html'
})
export class HomeComponent implements OnInit {
  searchQuery: string = '';

  // Usa l'interfaccia corretta invece del componente
  dailyMeme: MemeData | null = null;
  errorMessage: string | null = null;
  
  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private memeService: MemeService
  ) {}

  getAttachmentUrl(pathRelativo: string): string {
    if (!pathRelativo) return 'https://via.placeholder.com/400x400?text=Errore';

    // 1. Normalizza i backslash in slash
    let cleanPath = pathRelativo.replace(/\\/g, '/');

    // 2. Rimuovi slash iniziali se presenti
    cleanPath = cleanPath.replace(/^\/+/, '');

    // 3. Se il path NON contiene già 'uploads/', aggiungilo. 
    // Se lo contiene già (come nel tuo JSON), non fare nulla.
    if (!cleanPath.startsWith('uploads/')) {
      cleanPath = `uploads/${cleanPath}`;
    }

    return `http://localhost:3000/${cleanPath}`;
  }

  loadDailyMeme(): void {
    this.errorMessage = null; // Resetta l'errore all'inizio
    
    this.memeService.getMemeOfTheDay().subscribe({
      next: (meme) => {
        const imageUrl = this.getAttachmentUrl(meme.pathRelativo);
        this.dailyMeme = {
          imagePath: imageUrl,
          title: meme.titolo,
          author: meme.autore.username,
          upvotes: meme.upvotes,
          downvotes: meme.downvotes,
          isDaily: true
        };
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Distinguiamo in base allo status code del backend
        if (err.status === 404) {
          // Nessun meme trovato: non è un "errore", è solo un risultato vuoto
          this.dailyMeme = null;
          this.errorMessage = null;
        } else {
          // Errore reale (es. 500 o server offline)
          this.errorMessage = "Ops! Qualcosa è andato storto nei nostri server.";
          this.dailyMeme = null;
        }
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(query: string): void {
    this.router.navigate(['/search'], { 
      queryParams: { q: query } 
    });
  }
  
  ngOnInit(): void {
    this.loadDailyMeme();
  }
}