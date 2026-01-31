// meme.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaccia per il singolo Meme
export interface Meme {
  id: number;
  titolo: string;
  formato_file: string;
  autore: {
    id: number;
    username: string;
  };
  tags: string[];
  pathRelativo: string;
  data_caricamento: string;
  upvotes: number;
  downvotes: number;
}

// Nuova interfaccia per la risposta paginata
export interface SearchResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  memes: Meme[];
}

@Injectable({
  providedIn: 'root'
})
export class MemeService {
  private apiUrl = 'http://localhost:3000/api/meme';

  constructor(private http: HttpClient) {}

  getMemeOfTheDay(): Observable<Meme> {
    return this.http.get<Meme>(`${this.apiUrl}/daily`, { withCredentials: true });
  }

  /**
   * Cerca meme con supporto alla paginazione
   * @param query La stringa da cercare
   * @param page Il numero della pagina (default 1)
   * @param size Quanti elementi per pagina (default 10)
   */
  searchMemes(query: string, page: number = 1, size: number = 10): Observable<SearchResponse> {
    return this.http.get<SearchResponse>(`${this.apiUrl}/search`, {
      params: { 
        q: query,
        page: page.toString(),
        size: size.toString()
      },
      withCredentials: true
    });
  }
}