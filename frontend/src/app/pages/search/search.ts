import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Meme, MemeService } from '../../_services/meme';
import { SearchBarComponent } from "../../components/search-bar/search-bar";
import { MemePreviewComponent } from "../../components/meme-preview/meme-preview";
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-search',
  standalone: true,
  templateUrl: './search.html',
  imports: [CommonModule, SearchBarComponent, MemePreviewComponent]
})

export class SearchComponent implements OnInit {
  allResults: Meme[] = [];      // Tutti i dati dal server
  pagedResults: Meme[] = [];    // Solo i 10 da visualizzare
  
  lastQuery: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  sortBy: string = 'newest'; // Valore di default

  constructor(
    private route: ActivatedRoute,
    private memeService: MemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const newQuery = params['q'] || '';
      if (newQuery !== this.lastQuery) {
        this.lastQuery = newQuery;
        this.performApiCall(this.lastQuery);
      }
    });
  }

  performApiCall(query: string) {
    this.memeService.searchMemes(query).subscribe({
      next: (data) => {
        this.allResults = data;
        this.applySortAndPagination();
      },
      error: (err) => console.error(err)
    });
  }

  // Funzione principale per gestire la logica locale
  applySortAndPagination() {
    // 1. Ordinamento
    let sorted = [...this.allResults];
    
    switch (this.sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.data_caricamento).getTime() - new Date(a.data_caricamento).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.data_caricamento).getTime() - new Date(b.data_caricamento).getTime());
        break;
      case 'upvotes':
        sorted.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'downvotes':
        sorted.sort((a, b) => b.downvotes - a.downvotes);
        break;
    }

    // 2. Calcolo Paginazione
    this.totalPages = Math.ceil(sorted.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = 1;

    // 3. Taglio dell'array (Slice)
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedResults = sorted.slice(start, end);
  }

  onSortChange(event: any) {
    this.sortBy = event.target.value;
    this.currentPage = 1; // Torna alla prima pagina quando cambi ordine
    this.applySortAndPagination();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.applySortAndPagination();
    window.scrollTo(0, 0); // Torna su
  }

  onNewSearch(query: string) {
    this.router.navigate(['/search'], { queryParams: { q: query } });
  }
}