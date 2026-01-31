import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-meme-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meme-preview.html' 
})

export class MemePreviewComponent {
  @Input() id!: number;
  @Input() imagePath: string = '';
  @Input() title: string = '';
  @Input() author: string = '';
  @Input() upvotes: number = 0;

  constructor(private router: Router) {}

  goToDetails() {
    this.router.navigate(['/details', this.id]);
  }
}