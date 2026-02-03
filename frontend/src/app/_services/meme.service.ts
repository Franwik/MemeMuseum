// meme.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class MemeService {
  private apiUrl = 'http://localhost:3000/api/meme';
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getMemeImageUrl(path: string): string {
    if (!path) return '';
    // Converte eventuali backslash di Windows in slash e pulisce il percorso
    const cleanPath = path.replace(/\\/g, '/');
    return `${this.baseUrl}/${cleanPath}`;
  }

  getMemeOfTheDay(): Observable<Meme> {
    return this.http.get<Meme>(`${this.apiUrl}/daily`, { withCredentials: true });
  }

  // Recupera un meme specifico per ID
  getMemeById(id: number): Observable<Meme> {
    return this.http.get<Meme>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  voteMeme(id_utente: number, id_meme: number, tipo_voto: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/vote`, { id_utente, id_meme, tipo_voto }, { withCredentials: true });
  }

  searchMemes(query: string): Observable<Meme[]> {
    return this.http.get<Meme[]>(`${this.apiUrl}/search`, {
      params: { q: query },
      withCredentials: true
    });
  }
}