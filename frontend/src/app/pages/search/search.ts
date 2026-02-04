import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Meme, MemeService } from '../../_services/meme.service';
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
  allResults: Meme[] = [];
  pagedResults: Meme[] = [];
  
  lastQuery: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  sortBy: string = 'newest';

  constructor(
    private route: ActivatedRoute,
    private memeService: MemeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const newQuery = params['q'] || '';
      const page = params['page'] ? parseInt(params['page']) : 1;
      const sort = params['sort'] || 'newest';
      
      // Ripristina lo stato dalla URL
      this.currentPage = page;
      this.sortBy = sort;
      
      if (newQuery !== this.lastQuery) {
        this.lastQuery = newQuery;
        this.performApiCall(this.lastQuery);
      } else {
        // Se la query è la stessa, applica solo sort e paginazione
        this.applySortAndPagination();
      }
    });
  }

  performApiCall(query: string) {
    this.memeService.searchMemes(query).subscribe({
      next: (data) => {
        this.allResults = data;
        this.applySortAndPagination();
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
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
        sorted.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'downvotes':
        sorted.sort((a, b) => b.downvotes - a.downvotes);
        break;
    }

    this.totalPages = Math.ceil(sorted.length / this.pageSize);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedResults = sorted.slice(start, end);
  }

  onSortChange(event: any) {
    this.sortBy = event.target.value;
    this.currentPage = 1;
    this.updateUrl();
    this.applySortAndPagination();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.updateUrl();
    this.applySortAndPagination();
    window.scrollTo(0, 0);
  }

  updateUrl() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        q: this.lastQuery,
        page: this.currentPage,
        sort: this.sortBy
      },
      queryParamsHandling: 'merge'
    });
  }

  onNewSearch(query: string) {
    this.router.navigate(['/search'], { 
      queryParams: { 
        q: query,
        page: 1,
        sort: 'newest'
      } 
    });
  }
}