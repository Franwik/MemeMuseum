import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-meme-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meme-card.html'
})
export class MemeCardComponent {
  @Input() imageUrl: string = 'https://via.placeholder.com/400x400?text=Meme';
  @Input() title: string = 'Meme Title';
  @Input() author: string = 'Unknown';
  @Input() upvotes: number = 0;
  @Input() downvotes: number = 0;
  @Input() isDaily: boolean = false;
}