import { Directive } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { TranslocoService } from "@ngneat/transloco";
import {
  GenericModalComponent,
  GenericModalData,
  GenericModalType,
} from "../../components/generic-modal/generic-modal.component";
import { wait } from "../../utils";

@Directive()
export abstract class BaseDeletePageComponent<T> {
  isLoadingDelete = false;
  errorMessage = "";

  abstract moduleName: string;

  constructor(
    protected service: any,
    protected transloco: TranslocoService,
    protected dialog: MatDialog
  ) {}

  protected abstract getDeleteTitle(item: T): string;
  protected abstract getDeleteMessage(item: T): string;
  protected abstract getItemId(item: T): string;
  protected abstract getItemLabel(item: T): string;

  /** Nom de la méthode à appeler sur le service (ex: "delete", "remove", "archive") */
  protected abstract getDeleteMethodName(): string;

  /** Arguments passés à la méthode du service. Par défaut: [id] */
  protected getDeleteArgs(item: T): any[] {
    return [this.getItemId(item)];
  }

  handleDelete(item: T): void {
    const dialogRef = this.openDeleteModal(item);

    const sub = dialogRef.componentInstance.action.subscribe(async (result) => {
      if (result !== "confirm") {
        dialogRef.close();
        sub.unsubscribe();
        return;
      }

      const confirmAction = dialogRef.componentInstance.data?.actions?.find(
        (a) => a.id === "confirm"
      );
      if (confirmAction) confirmAction.isLoading = true;

      await wait();

      const methodName = this.getDeleteMethodName();
      const serviceMethod = this.service?.[methodName];

      if (typeof serviceMethod !== "function") {
        // Méthode introuvable -> afficher une erreur propre
        this.errorMessage = this.transloco.translate("general.genericError");
        this.showResultModal(
          dialogRef,
          `${this.moduleName}.delete.error.title`,
          this.errorMessage,
          this.getItemLabel(item),
          "danger"
        );
        this.isLoadingDelete = false;
        sub.unsubscribe();
        return;
      }

      const args = this.getDeleteArgs(item);
      // On suppose que la méthode retourne un Observable (pattern de tes services)
      const obs$ = serviceMethod.apply(this.service, args);

      obs$.subscribe({
        next: async () => {
          await wait();

          this.showResultModal(
            dialogRef,
            `${this.moduleName}.delete.success.title`,
            `${this.moduleName}.delete.success.message`,
            this.getItemLabel(item),
            "info",
            () => this.afterDeleteSuccess()
          );
        },
        error: async (error: any) => {
          await wait();

          this.errorMessage =
            error?.error?.message ||
            this.transloco.translate("general.genericError");

          this.showResultModal(
            dialogRef,
            `${this.moduleName}.delete.error.title`,
            this.errorMessage, // message direct (ou clé i18n si existante)
            this.getItemLabel(item),
            "danger"
          );
        },
        complete: () => {
          this.isLoadingDelete = false;
          sub.unsubscribe();
        },
      });
    });
  }

  /** Hook optionnel à surcharger si besoin (ex: recharger la liste) */
  protected afterDeleteSuccess(): void {}

  openDeleteModal(item: T): MatDialogRef<GenericModalComponent> {
    const modalData: GenericModalData = {
      title: this.getDeleteTitle(item),
      content: this.getDeleteMessage(item),
      actions: [
        {
          id: "cancel",
          label: this.transloco.translate("general.cancel"),
        },
        {
          id: "confirm",
          label: this.transloco.translate("general.delete"),
          color: "warn",
        },
      ],
    };

    return this.dialog.open(GenericModalComponent, {
      width: "400px",
      data: modalData,
      disableClose: true,
    });
  }

  protected showResultModal(
    dialogRef: MatDialogRef<GenericModalComponent>,
    titleKey: string,
    messageKeyOrText: string,
    name: string,
    type: GenericModalType = "info",
    cb?: Function
  ) {
    const instance = dialogRef.componentInstance;
    if (!instance) return;

    // Si c'est une clé i18n, Transloco renverra la clé si elle n'existe pas,
    // sinon on affiche tel quel le message (ex: this.errorMessage)
    const title = this.transloco.translate(titleKey);
    const content = this.transloco.translate(messageKeyOrText, { name });

    instance.data.title = title;
    instance.data.content = content;
    instance.data.type = type;
    instance.data.actions = [
      {
        id: "ok",
        label: this.transloco.translate("general.ok"),
        color: "primary",
      },
    ];

    const sub = instance.action.subscribe((res) => {
      if (res === "ok") {
        dialogRef.close();
        sub.unsubscribe();
        cb?.();
      }
    });
  }
}
