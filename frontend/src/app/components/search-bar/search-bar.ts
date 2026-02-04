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
  searchDate: string = ''; // Nuova variabile per l'input date

  // Emettiamo un oggetto con entrambi i parametri
  @Output() search = new EventEmitter<{q: string, date: string}>();

  handleSearch(): void {
    // Emittiamo l'evento anche se solo uno dei due campi è pieno
    if (this.query.trim() || this.searchDate) {
      this.search.emit({
        q: this.query.trim(),
        date: this.searchDate
      });
    }
  }
}