import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { TranslocoService } from "@ngneat/transloco";
import { BaseDeletePageComponent } from "../../pages/base-delete-page/base-delete-page.component";

@Component({
  selector: "app-generic-delete-item-button",
  templateUrl: "./generic-delete-item-button.component.html",
  styleUrl: "./generic-delete-item-button.component.scss",
})
export class GenericDeleteItemButtonComponent<T = any>
  extends BaseDeletePageComponent<T>
  implements OnInit
{
  /** Élément à supprimer */
  @Input() item!: T;

  /**
   * Service qui expose `delete(id: string)`
   * Ex: CompaniesService, CandidatesService, etc.
   */
  @Input() override service: { delete: (id: string) => any } = {
    delete: () => null,
  };

  /** Nom du module (utilisé pour les clés i18n) */
  @Input() override moduleName!: string;

  /** Clés i18n personnalisables (sinon: `${moduleName}.delete.title/message`) */
  @Input() titleKey?: string;
  @Input() messageKey?: string;
  @Input() methodName?: string;

  /**
   * Extracteurs d'ID et de libellé (fallback: id/name)
   * Exemple: (e) => e.id  |  (e) => e.title
   */
  @Input() extractId?: (item: T) => string;
  @Input() extractLabel?: (item: T) => string;
  @Input() buildPayload?: (item: T) => any;

  /** Désactiver le bouton */
  @Input() disabled = false;

  /** Classe CSS de l’icône (Font Awesome) */
  @Input() iconClass = "fa-solid fa-trash";

  /** Couleur du bouton (si tu utilises Angular Material) */
  @Input() color: "primary" | "accent" | "warn" | undefined = "warn";

  @Output() onDone: EventEmitter<void> = new EventEmitter();

  constructor(
    protected override transloco: TranslocoService,
    protected override dialog: MatDialog
  ) {
    // On passe un "service" placeholder au super ;
    // on assignera le vrai via l'@Input() dans ngOnInit.
    // (BaseDeletePageComponent lit this.service au moment du handleDelete)
    // @ts-ignore
    super({ delete: () => null }, transloco, dialog);
  }

  ngOnInit(): void {
    // Branche le vrai service reçu en @Input
    this["service"] = this.service;
  }

  /** Clique sur le bouton -> ouvrir le modal de delete */
  onClick(): void {
    if (!this.item || !this.service) return;
    this.handleDelete(this.item);
  }

  // ---------- Implémentations requises par BaseDeletePageComponent ----------

  protected getDeleteTitle(_item: T): string {
    const key = this.titleKey || `${this.moduleName}.delete.title`;
    return this.transloco.translate(key);
  }

  protected getDeleteMessage(item: T): string {
    const key = this.messageKey || `${this.moduleName}.delete.message`;
    return this.transloco.translate(key, { name: this.getItemLabel(item) });
  }

  protected getItemId(item: T): string {
    if (this.extractId) return this.extractId(item);
    // Fallbacks courants
    // @ts-ignore
    return item?.id ?? item?.uuid ?? "";
  }

  protected getItemLabel(item: T): string {
    if (this.extractLabel) return this.extractLabel(item);
    // @ts-ignore
    return item?.name ?? item?.title ?? this.moduleName;
  }

  protected getDeleteMethodName(): string {
    return this.methodName ?? "delete"; // ou "remove", "archive", etc.
  }

  // Si ta méthode nécessite autre chose que l'ID :
  protected override getDeleteArgs(item: T): any[] {
    // ex: delete(companyId, { hard: true })
    return [this.buildPayload ? this.buildPayload(item) : item, { hard: true }];
  }

  protected override afterDeleteSuccess() {
    this.onDone.emit();
  }
}
