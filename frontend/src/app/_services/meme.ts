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

  searchMemes(query: string): Observable<Meme[]> {
    return this.http.get<Meme[]>(`${this.apiUrl}/search`, {
      params: { q: query },
      withCredentials: true
    });
  }
  
}