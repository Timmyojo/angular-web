import {
  Component,
  EventEmitter,
  Injector,
  Input,
  Output,
} from "@angular/core";
import { GenericDatatableColumnDef } from "../generic-datatable.component";
import { CommonModule } from "@angular/common";
import { GenericDatatableActionsCellComponent } from "../generic-datatable-actions-cell/generic-datatable-actions-cell.component";

@Component({
  selector: "app-generic-datatable-cell",
  standalone: true,
  imports: [CommonModule, GenericDatatableActionsCellComponent],
  templateUrl: "./generic-datatable-cell.component.html",
  styleUrl: "./generic-datatable-cell.component.scss",
})
export class GenericDatatableCellComponent<T = any> {
  @Input() index: number = 0;
  @Input() item!: T;
  @Input() column!: GenericDatatableColumnDef<T>;
  @Input() injector!: Injector;

  @Output() view = new EventEmitter<T>();
  @Output() edit = new EventEmitter<T>();
  @Output() delete = new EventEmitter<T>();

  createInjector(): Injector {
    const inputsObj = this.column.inputs
      ? this.column.inputs(this.item) || {}
      : {};

    const providers = Object.entries(inputsObj).map(([key, value]) => ({
      provide: key,
      useValue: value,
    }));

    return Injector.create({
      providers,
      parent: this.injector,
    });
  }

  hasAction(): boolean {
    return !!(
      this.column.canEdit ||
      this.column.canView ||
      this.column.canDelete ||
      (this.column.customActions && this.column.customActions.length > 0)
    );
  }

  handleView(): void {
    this.view.emit(this.item);
  }

  handleEdit(): void {
    this.edit.emit(this.item);
  }

  handleDelete(): void {
    this.delete.emit(this.item);
  }

  /** 🔧 Récupérer la valeur d'une cellule (supporte les chemins imbriqués) */
  getCellValue(): any {
    if (!this.column.key) return undefined;
    const keyStr = this.column.key as string;

    // Vérifier si c'est un chemin imbriqué (contient un point)
    if (keyStr.includes(".")) {
      return this.getNestedValue(this.item, keyStr);
    } else {
      return (this.item as any)[this.column.key];
    }
  }

  /** 🔧 Récupération de valeur imbriquée */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split(".");
    let value = obj;
    for (const key of keys) {
      if (value === null || value === undefined) return undefined;
      value = value[key];
    }
    return value;
  }
}
