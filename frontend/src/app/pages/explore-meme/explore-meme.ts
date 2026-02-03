import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Meme, MemeService } from '../../_services/meme.service';
import { SearchBarComponent } from "../../components/search-bar/search-bar";
import { MemePreviewComponent } from "../../components/meme-preview/meme-preview";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-explore-meme',
  standalone: true,
  templateUrl: './explore-meme.html',
  imports: [CommonModule, SearchBarComponent, MemePreviewComponent]
})
export class ExploreMemeComponent implements OnInit {
  allResults: Meme[] = [];      
  pagedResults: Meme[] = [];    
  
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  sortBy: string = 'newest';

  constructor(
    private memeService: MemeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllMemes();
  }

  loadAllMemes() {
    // Usiamo l'endpoint /getall tramite il servizio
    this.memeService.getAllMemes().subscribe({
      next: (data) => {
        this.allResults = data;
        this.applySortAndPagination();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Errore nel caricamento dei meme:', err)
    });
  }

  applySortAndPagination() {
    let sorted = [...this.allResults];
    
    switch (this.sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.data_caricamento).getTime() - new Date(a.data_caricamento).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.data_caricamento).getTime() - new Date(b.data_caricamento).getTime());
        break;
      case 'upvotes':
        sorted.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
        break;
      case 'downvotes':
        sorted.sort((a, b) => (b.downvotes || 0) - (a.downvotes || 0));
        break;
    }

    this.totalPages = Math.ceil(sorted.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = 1;

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedResults = sorted.slice(start, end);
  }

  onSortChange(event: any) {
    this.sortBy = event.target.value;
    this.currentPage = 1;
    this.applySortAndPagination();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.applySortAndPagination();
    window.scrollTo(0, 0);
  }

  onNewSearch(query: string) {
    // Se l'utente usa la barra di ricerca, lo mandiamo alla pagina search dedicata
    this.router.navigate(['/search'], { queryParams: { q: query } });
  }
}