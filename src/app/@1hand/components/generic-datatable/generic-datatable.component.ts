import { CommonModule, NgComponentOutlet } from "@angular/common";
import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  Type,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TranslocoModule, TranslocoService } from "@ngneat/transloco";
import { debounceTime, Subject } from "rxjs";
import { GenericDatatableCellComponent } from "./generic-datatable-cell/generic-datatable-cell.component";

/** 🔹 Boutons d'action personnalisés */
export interface CustomActionButton<T = any> {
  icon: string;
  text?: string;
  title: string;
  callback: (item: T) => void;
  color?: string;
  visible?: (item: T) => boolean;
}

/** 🔹 Configuration d'édition de cellule */
export interface EditConfig {
  type: "text" | "number" | "date" | "checkbox" | "select" | "textarea";
  placeholder?: string;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

/** 🔹 Définition d'une colonne générique */
export interface GenericDatatableColumnDef<T = any> {
  key?: keyof T | string;
  label: string;
  align?: "left" | "center";
  width?: string;
  render?: Type<any>;
  renderValue?: (item: T, index: number) => string;
  template?: TemplateRef<any>;
  renderList?: (row: T) => string[];
  inputs?: (row: T) => Record<string, any>;
  editable?: boolean;
  editConfig?: EditConfig;
  canEdit?: boolean;
  canView?: boolean;
  canDelete?: boolean;
  customActions?: CustomActionButton<T>[];
  translateLabel?: boolean;
}

/** 🔹 Composant principal du tableau générique */
@Component({
  selector: "app-generic-datatable",
  templateUrl: "./generic-datatable.component.html",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgComponentOutlet,
    TranslocoModule,
    GenericDatatableCellComponent,
  ],
})
export class GenericDatatableComponent<T = any> implements OnInit {
  // === Données principales ===
  @Input() items: T[] = [];
  @Input() columns: GenericDatatableColumnDef<T>[] = [];
  @Input() editable: boolean = false;

  // === États globaux ===
  @Input() isLoading = false;
  @Input() hasError = false;
  @Input() isEditMode = false;
  @Input() isSaving = false;

  // === Texte vide ===
  @Input() emptyIcon = "fas fa-database";
  @Input() emptyTitle = "Aucune donnée trouvée";
  @Input() emptySubtitle = "";

  // === Création ===
  @Input() showCreateButton = false;
  @Input() createLabel = "Créer";

  // === Traduction ===
  @Input() translationNamespace?: string;

  // === Colonnes visibles ===
  @Input() defaultVisibleCount = 5;
  @Input() showColumnSelectorButton = true;
  @Input() set customVisibleColumns(cols: GenericDatatableColumnDef<T>[]) {
    if (cols && cols.length > 0) {
      this._customVisibleColumns = cols;
      this.visibleColumns = cols;
    }
  }
  private _customVisibleColumns: GenericDatatableColumnDef<T>[] = [];
  visibleColumns: GenericDatatableColumnDef<T>[] = [];

  // === Événements ===
  @Output() create = new EventEmitter<void>();
  @Output() view = new EventEmitter<T>();
  @Output() update = new EventEmitter<T>();
  @Output() delete = new EventEmitter<T>();
  @Output() inlineChange = new EventEmitter<T[]>();
  @Output() save = new EventEmitter<T[]>();
  @Output() cancel = new EventEmitter<T[]>();

  // === États internes ===
  showColumnSelector = false;
  private inlineEditSubject = new Subject<T[]>();
  private originalItems: T[] = [];
  hasChanges = false;

  constructor(private injector: Injector, private transloco: TranslocoService) {
    this.inlineEditSubject.pipe(debounceTime(600)).subscribe((items) => {
      this.inlineChange.emit(items);
      this.hasChanges = true;
    });
  }

  /** 🔹 Initialisation */
  ngOnInit(): void {
    // Si des colonnes personnalisées ont été fournies, ne pas les écraser
    if (this._customVisibleColumns.length === 0) {
      // Initialiser les colonnes visibles
      this.visibleColumns = this.columns.slice(0, this.defaultVisibleCount);

      // S'assurer que la colonne action est toujours visible et en dernier
      const actionColumn = this.columns.find((col) => this.isActionColumn(col));
      if (actionColumn) {
        // Retirer la colonne action si elle existe déjà dans visibleColumns
        this.visibleColumns = this.visibleColumns.filter(
          (col) => !this.isActionColumn(col)
        );
        // Ajouter la colonne action à la fin
        this.visibleColumns.push(actionColumn);
      }
    }

    this.originalItems = JSON.parse(JSON.stringify(this.items));
  }

  /** 🔹 Synchronisation parent */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isEditMode"]) {
      this.isEditMode = changes["isEditMode"].currentValue;
      if (this.isEditMode) {
        this.originalItems = JSON.parse(JSON.stringify(this.items));
        this.hasChanges = false;
      }
    }
    if (changes["isSaving"]) {
      this.isSaving = changes["isSaving"].currentValue;
    }
  }

  /** 🔹 Gestion des colonnes visibles */
  isColumnVisible(column: GenericDatatableColumnDef<T>): boolean {
    return this.visibleColumns.includes(column);
  }

  /** 🔹 Vérifier si c'est une colonne action */
  isActionColumn(column: GenericDatatableColumnDef<T>): boolean {
    return !!(
      column.customActions ||
      column.canEdit ||
      column.canView ||
      column.canDelete ||
      column.label.toLowerCase().includes("action")
    );
  }

  toggleColumn(column: GenericDatatableColumnDef<T>): void {
    // Ne pas permettre de désactiver la colonne action
    if (this.isActionColumn(column)) {
      return;
    }

    if (this.isColumnVisible(column)) {
      if (this.visibleColumns.length > 1)
        this.visibleColumns = this.visibleColumns.filter((c) => c !== column);
    } else {
      // Ajouter la colonne mais garder la colonne action en dernier
      this.visibleColumns.push(column);
      this.ensureActionColumnIsLast();
    }
  }

  /** 🔹 S'assurer que la colonne action est toujours en dernier */
  private ensureActionColumnIsLast(): void {
    const actionColumnIndex = this.visibleColumns.findIndex((col) =>
      this.isActionColumn(col)
    );

    if (
      actionColumnIndex !== -1 &&
      actionColumnIndex !== this.visibleColumns.length - 1
    ) {
      // Retirer la colonne action de sa position actuelle
      const actionColumn = this.visibleColumns.splice(actionColumnIndex, 1)[0];
      // La remettre à la fin
      this.visibleColumns.push(actionColumn);
    }
  }

  /** 🌍 Traduction des labels */
  getTranslatedLabel(column: GenericDatatableColumnDef<T>): string {
    if (!column.translateLabel) return column.label;
    if (this.translationNamespace)
      return this.transloco.translate(
        `${this.translationNamespace}.${column.label}`
      );
    return this.transloco.translate(column.label);
  }

  /** 🧩 Injection dynamique pour cellules custom */
  createInjector(column: GenericDatatableColumnDef<T>, item: T): Injector {
    const inputsObj = column.inputs ? column.inputs(item) || {} : {};
    const providers = Object.entries(inputsObj).map(([key, value]) => ({
      provide: key,
      useValue: value,
    }));
    return Injector.create({ providers, parent: this.injector });
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

  /** 🔧 Récupérer la valeur d'une cellule (supporte les chemins imbriqués) */
  getCellValue(item: T, column: GenericDatatableColumnDef<T>): any {
    if (!column.key) return undefined;
    const keyStr = column.key as string;

    // Vérifier si c'est un chemin imbriqué (contient un point)
    if (keyStr.includes(".")) {
      return this.getNestedValue(item, keyStr);
    } else {
      return (item as any)[column.key];
    }
  }

  /** 🔧 Définition de valeur imbriquée */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    let current = obj;

    // Créer les objets intermédiaires si nécessaire
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key];
    }

    // Définir la valeur finale
    current[keys[keys.length - 1]] = value;
  }

  /** ✏️ Gestion de l'édition inline */
  onInlineEdit(
    item: T,
    column: GenericDatatableColumnDef<T>,
    event: any
  ): void {
    if (!column.key) return;
    const newValue =
      event?.target?.type === "checkbox"
        ? event.target.checked
        : event?.target?.value ?? event;
    const isEmpty =
      newValue === null ||
      newValue === undefined ||
      (typeof newValue === "string" && newValue.trim() === "");
    if (isEmpty) return;

    const keyStr = column.key as string;

    // Vérifier si c'est un chemin imbriqué (contient un point)
    if (keyStr.includes(".")) {
      this.setNestedValue(item, keyStr, newValue);
    } else {
      (item as any)[column.key] = newValue;
    }

    this.inlineEditSubject.next(this.items);
  }

  /** 💾 Sauvegarde */
  saveAll(): void {
    this.save.emit(this.items);
    this.hasChanges = false;
  }

  /** ❌ Annulation */
  cancelAll(): void {
    if (!this.hasChanges) return;
    this.items = JSON.parse(JSON.stringify(this.originalItems));
    this.hasChanges = false;
    this.cancel.emit(this.originalItems);
  }

  /** 🔄 Bascule du mode édition local */
  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.originalItems = JSON.parse(JSON.stringify(this.items));
      this.hasChanges = false;
    }
  }

  /** ⚡ Optimisation Angular */
  trackByItem(index: number, item: any): any {
    if (item && typeof item === "object") {
      if ("id" in item) return (item as any).id;
      if ("uid" in item) return (item as any).uid;
    }
    return index;
  }
}
