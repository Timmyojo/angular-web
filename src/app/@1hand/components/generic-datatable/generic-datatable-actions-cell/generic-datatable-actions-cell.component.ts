import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CustomActionButton } from "../generic-datatable.component";

@Component({
  selector: "app-generic-datatable-actions-cell",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./generic-datatable-actions-cell.component.html",
  styleUrl: "./generic-datatable-actions-cell.component.scss",
})
export class GenericDatatableActionsCellComponent<T = any> {
  @Input() item!: T;
  @Input() canView?: boolean = false;
  @Input() canEdit?: boolean = false;
  @Input() canDelete?: boolean = false;
  @Input() customActions?: CustomActionButton<T>[];

  @Output() view = new EventEmitter<T>();
  @Output() edit = new EventEmitter<T>();
  @Output() delete = new EventEmitter<T>();

  onView() {
    this.view.emit(this.item);
  }

  onEdit() {
    this.edit.emit(this.item);
  }

  onDelete() {
    this.delete.emit(this.item);
  }

  onCustomAction(action: CustomActionButton<T>) {
    action.callback(this.item);
  }

  isActionVisible(action: CustomActionButton<T>): boolean {
    return action.visible ? action.visible(this.item) : true;
  }

  getActionColorClass(color?: string): string {
    const colorMap: Record<string, string> = {
      blue: "hover:bg-blue-500",
      green: "hover:bg-green-500",
      red: "hover:bg-red-500",
      yellow: "hover:bg-yellow-500",
      purple: "hover:bg-purple-500",
      orange: "hover:bg-orange-500",
    };
    return colorMap[color || "blue"] || "hover:bg-blue-500";
  }
}
