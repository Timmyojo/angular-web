import { Directive, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { TranslocoService } from "@ngneat/transloco";
import {
  GenericModalComponent,
  GenericModalType,
} from "../../components/generic-modal/generic-modal.component";
import { wait } from "../../utils";

@Directive()
export abstract class BaseCreatePageComponent<TCreateDto, TObject>
  implements OnInit
{
  isLoading = false;
  hasError = false;
  errorMessage = "";

  dialogRef!: MatDialogRef<any>;

  abstract moduleName: string;

  constructor(
    protected service: { create: (dto: TCreateDto) => any },
    protected dialog: MatDialog,
    protected transloco: TranslocoService,
    protected router: Router,
    protected route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.onInitParams();
  }

  protected abstract onInitParams(): void;
  protected abstract buildPayload(formData: any): TCreateDto;
  protected abstract getItemLabel(item: TObject): string;

  onSubmit(formData: any): void {
    const payload = this.buildPayload(formData);
    this.handleCreate(payload);
  }

  handleCreate(data: TCreateDto): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = "";

    this.service.create(data).subscribe({
      next: async (createdItem: TObject) => {
        await wait();

        // this.isLoading = false;
        // this.hasError = false;
        // this.errorMessage = "";

        const dialogRef = this.dialog.open(GenericModalComponent, {
          disableClose: true,
          data: { type: "info", title: "", content: "", actions: [] },
        });

        this.showResultModal(
          this.dialogRef ? this.dialogRef : dialogRef,
          `${this.moduleName}.create.success.title`,
          `${this.moduleName}.create.success.message`,
          this.getItemLabel(createdItem),
          "info",
          () => this.router.navigate(["../list"], { relativeTo: this.route })
        );
      },
      error: async (error: any) => {
        await wait();

        this.isLoading = false;
        this.hasError = true;
        this.errorMessage =
          error?.error?.message ||
          this.transloco.translate("general.genericError");

        const dialogRef = this.dialog.open(GenericModalComponent, {
          disableClose: true,
          data: { type: "info", title: "", content: "", actions: [] },
        });

        this.showResultModal(
          dialogRef,
          `${this.moduleName}.create.error.title`,
          `${this.moduleName}.create.error.message`,
          this.moduleName,
          "danger"
        );
      },
    });
  }

  protected showResultModal(
    dialogRef: MatDialogRef<GenericModalComponent>,
    titleKey: string,
    messageKey: string,
    name: string,
    type: GenericModalType = "info",
    onClose?: () => void
  ) {
    const instance = dialogRef.componentInstance;

    if (!instance) return;

    instance.data.title = this.transloco.translate(titleKey);
    instance.data.content = this.transloco.translate(messageKey, { name });
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
        if (onClose) onClose();
      }
    });
  }

  handleBack(): void {
    this.router.navigate(["../list"], { relativeTo: this.route });
  }
}
