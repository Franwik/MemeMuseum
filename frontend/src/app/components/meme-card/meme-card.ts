import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-meme-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meme-card.html'
})
export class MemeCardComponent {
  @Input() id: string | number = '';
  @Input() imagePath: string = 'https://via.placeholder.com/400x400?text=Meme';
  @Input() title: string = 'Meme Title';
  @Input() author: string = 'Unknown';
  @Input() upvotes: number = 0;
  @Input() downvotes: number = 0;
  @Input() isDaily: boolean = false;
  @Input() tags: string[] = [];
  @Input() dataCaricamento: string = '';

  constructor(private router: Router) {}

  navigateToDetails(): void {
    if (this.id) {
      this.router.navigate(['/details', this.id]);
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}