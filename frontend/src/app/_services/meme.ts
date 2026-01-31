// meme.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface DailyMeme {
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

  constructor(private http: HttpClient) {}

  getMemeOfTheDay(): Observable<DailyMeme> {
    return this.http.get<DailyMeme>(`${this.apiUrl}/daily`, { withCredentials: true });
  }

}