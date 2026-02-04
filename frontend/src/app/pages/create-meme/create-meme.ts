import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MemeService } from '../../_services/meme.service';
import { AuthService, User } from '../../_services/auth.service';

@Component({
  selector: 'app-create-meme',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-meme.html'
})
export class CreateMemeComponent implements OnInit {
  titolo: string = '';
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  tags: string[] = [];
  newTag: string = '';
  isUploading: boolean = false;
  uploadSuccess: boolean = false;
  uploadError: string | null = null;
  currentUser: User | null = null;
  existingTags: string[] = [];
  filteredSuggestions: string[] = [];

  constructor(
    private memeService: MemeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verifica che l'utente sia autenticato
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        // Se non autenticato, reindirizza al login
        this.router.navigate(['/login']);
      }
    });
    this.loadExistingTags();
  }

  loadExistingTags() {
    // Assicurati di aggiungere getAllTags() nel tuo meme.service.ts
    this.memeService.getAllTags().subscribe(tags => {
      this.existingTags = tags;
    });
  }

  filterTags() {
    const query = this.newTag.toLowerCase().trim();
    if (!query) {
      this.filteredSuggestions = [];
      return;
    }
    // Filtra i tag esistenti escludendo quelli già aggiunti
    this.filteredSuggestions = this.existingTags.filter(t => 
      t.toLowerCase().includes(query) && !this.tags.includes(t)
    ).slice(0, 5); // Mostra solo i primi 5
  }

  selectSuggestion(tag: string) {
    this.newTag = tag;
    this.addTag(); // Aggiunge il tag e pulisce i suggerimenti
    this.filteredSuggestions = [];
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  handleFile(file: File): void {
    // Validazione tipo file - solo PNG, JPG e JPEG
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['png', 'jpg', 'jpeg'];
    
    if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension || '')) {
      this.uploadError = 'Formato non supportato. Usa solo PNG, JPG o JPEG';
      return;
    }

    // Validazione dimensione (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.uploadError = 'Il file è troppo grande. Dimensione massima: 10MB';
      return;
    }

    this.selectedFile = file;
    this.uploadError = null;

    // Crea preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  addTag(event?: Event) {
    event?.preventDefault();

    const tag = this.newTag.trim().toLowerCase();
    if (!tag || this.tags.includes(tag)) return;

    this.tags.push(tag);
    this.newTag = '';
    this.filteredSuggestions = [];
  }

  removeTag(index: number): void {
    this.tags.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  onSubmit(): void {
    if (!this.currentUser || !this.selectedFile || !this.titolo.trim()) {
      this.uploadError = 'Compila tutti i campi obbligatori';
      return;
    }

    this.isUploading = true;
    this.uploadError = null;
    this.uploadSuccess = false;

    // Crea FormData
    const formData = new FormData();
    formData.append('immagine', this.selectedFile);
    formData.append('titolo', this.titolo.trim());
    formData.append('id_autore', this.currentUser.id.toString());
    formData.append('tags', JSON.stringify(this.tags));

    // Invia al backend
    this.memeService.uploadMeme(formData).subscribe({
      next: (response) => {
        console.log('Meme caricato:', response);
        this.isUploading = false;
        this.uploadSuccess = true;
        
        // Reindirizza alla home dopo 2 secondi
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000);
      },
      error: (error) => {
        console.error('Errore upload:', error);
        this.isUploading = false;
        this.uploadError = error.error?.error || 'Errore durante il caricamento del meme';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/home']);
  }
}