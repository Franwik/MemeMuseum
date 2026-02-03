import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../_services/auth.service';
import { MemeService, Meme, Commento } from '../../_services/meme.service';
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
  comments: Commento[] = [];
  newComment: string = '';
  isLoadingComments: boolean = false;
  isSendingComment: boolean = false;

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
        this.cdr.detectChanges();
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
    this.isLoadingComments = true;
    this.memeService.getMemeComments(memeId).subscribe({
      next: (data) => {
        this.comments = data;
        this.isLoadingComments = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Errore nel caricamento dei commenti", err);
        this.isLoadingComments = false;
        this.cdr.detectChanges();
      }
    });
  }

  sendComment() {
    if (!this.currentUser || !this.meme || !this.newComment.trim()) {
      return;
    }

    this.isSendingComment = true;

    this.memeService.postComment(this.currentUser.id, this.meme.id, this.newComment).subscribe({
      next: (response) => {
        console.log("Commento inviato con successo", response);
        this.newComment = ''; // Resetta il campo
        this.loadComments(this.meme!.id); // Ricarica i commenti
        this.isSendingComment = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Errore nell'invio del commento", err);
        this.isSendingComment = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Formatta la data del commento in modo leggibile
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Adesso';
    if (diffMins < 60) return `${diffMins} minuti fa`;
    if (diffHours < 24) return `${diffHours} ore fa`;
    if (diffDays < 7) return `${diffDays} giorni fa`;
    
    return date.toLocaleDateString('it-IT', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }
}