import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MemeService } from '../../_services/meme';
import { SearchBarComponent } from "../search-bar/search-bar";
import { MemePreviewComponent } from "../meme-preview/meme-preview";
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-search',
  standalone: true,
  templateUrl: './search.html',
  imports: [CommonModule, SearchBarComponent, MemePreviewComponent]
})

export class SearchComponent implements OnInit {
  results: any[] = [];
  lastQuery: string = '';
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    private route: ActivatedRoute,
    private memeService: MemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.lastQuery = params['q'] || '';
      this.currentPage = +(params['page'] || 1); // Legge la pagina dall'URL
      
      if (this.lastQuery) {
        this.performApiCall(this.lastQuery, this.currentPage);
      }
    });
  }

  performApiCall(query: string, page: number) {
    this.memeService.searchMemes(query, page).subscribe({
      next: (data) => {
        this.results = data.memes; // Usa la struttura paginata del backend
        this.totalPages = data.totalPages;
      },
      error: (err) => console.error(err)
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.lastQuery, page: page } 
      });
    }
  }

  onNewSearch(query: string) {
    this.router.navigate(['/search'], { queryParams: { q: query, page: 1 } });
  }
}