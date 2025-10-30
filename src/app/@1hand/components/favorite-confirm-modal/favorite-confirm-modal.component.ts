import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-favorite-confirm-modal',
  templateUrl: './favorite-confirm-modal.component.html',
  styleUrl: './favorite-confirm-modal.component.scss'
})
export class FavoriteConfirmModalComponent {
@Input() isOpen: boolean = false;
  @Input() itemName: string = '';
  @Input() isFavorite: boolean = false;
  @Output() confirm = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  closeModal(event?: MouseEvent): void {
    if (event && event.target !== event.currentTarget) return;
    this.isOpen = false;
    this.close.emit();
  }

  confirmAction(): void {
    this.confirm.emit(!this.isFavorite);
    this.closeModal();
  }
}
