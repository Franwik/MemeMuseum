import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../_services/auth.service';
import { MemeService, Meme } from '../../_services/meme.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-memedetails',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './memedetails.html'
})
export class MemeDetailsComponent implements OnInit {
  meme: Meme | null = null;
  currentUser: User | null = null;
  comments: any[] = [];
  newComment: string = '';

  constructor(
    private route: ActivatedRoute,
    private memeService: MemeService,
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    // Sottoscrizione all'utente loggato
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.cdr.detectChanges();
    });

    if (id) {
      this.loadMeme(id);
      this.loadComments(id);
    }
  }

  getAttachmentUrl(pathRelativo: string): string {
    if (!pathRelativo) return 'https://via.placeholder.com/400x400?text=Errore';

    // 1. Normalizza i backslash in slash
    let cleanPath = pathRelativo.replace(/\\/g, '/');

    // 2. Rimuovi slash iniziali se presenti
    cleanPath = cleanPath.replace(/^\/+/, '');

    // 3. Se il path NON contiene già 'uploads/', aggiungilo
    if (!cleanPath.startsWith('uploads/')) {
      cleanPath = `uploads/${cleanPath}`;
    }

    return `http://localhost:3000/${cleanPath}`;
  }

  loadMeme(id: number) {
    this.memeService.getMemeById(id).subscribe({
      next: (data) => {
        this.meme = data;
        this.cdr.detectChanges(); // Forza il rilevamento delle modifiche
      },
      error: (err) => console.error("Errore nel caricamento del meme", err)
    });
  }

  onVote(tipo: number) {
    if (!this.currentUser || !this.meme) return;

    this.memeService.voteMeme(this.currentUser.id, this.meme.id, tipo).subscribe({
      next: () => {
        this.loadMeme(this.meme!.id); // Ricarica per aggiornare i voti
      },
      error: (err) => console.error("Errore nel voto", err)
    });
  }

  loadComments(memeId: number) {
    // TODO: Implementa il caricamento dei commenti quando avrai l'endpoint
  }

  sendComment() {
    // TODO: Implementa l'invio del commento quando avrai l'endpoint
  }
}