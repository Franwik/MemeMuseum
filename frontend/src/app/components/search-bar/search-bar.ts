import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html'
})

export class SearchBarComponent {
  query: string = '';

  // Emettiamo l'evento così il componente padre (Home) sa cosa cercare
  @Output() search = new EventEmitter<string>();

  handleSearch(): void {
    if (this.query.trim()) {
      this.search.emit(this.query.trim());
    }
  }
}