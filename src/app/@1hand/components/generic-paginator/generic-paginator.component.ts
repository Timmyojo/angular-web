import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-generic-paginator",
  templateUrl: "./generic-paginator.component.html",
  styleUrl: "./generic-paginator.component.scss",
})
export class GenericPaginatorComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() maxVisible = 5;
  @Input() totalItems = 0;
  @Input() itemsPerPage = 10;
  @Input() pageSize = 10;

  @Output() pageChange = new EventEmitter<number>();

  changePage(page: number) {
    if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  get visiblePages(): number[] {
    const pages = [];
    const half = Math.floor(this.maxVisible / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + this.maxVisible - 1);

    if (end - start + 1 < this.maxVisible) {
      start = Math.max(1, end - this.maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Méthodes pour calculer les informations de pagination
  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }
}
