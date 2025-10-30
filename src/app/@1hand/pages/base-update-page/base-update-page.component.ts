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
export abstract class BaseUpdatePageComponent<TUpdateDto, TObject>
  implements OnInit
{
  isLoading = false;
  hasError = false;
  errorMessage = "";

  itemId!: string;
  item: TObject = {} as TObject;

  abstract moduleName: string;

  constructor(
    protected service: {
      selectById: (id: string) => any;
      update: (id: string, dto: TUpdateDto) => any;
    },
    protected dialog: MatDialog,
    protected transloco: TranslocoService,
    protected router: Router,
    protected route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get(this.getItemIdParamName());
      if (!id) {
        throw new Error(
          `Missing Id to load item: ${this.getItemIdParamName()}`
        );
      }

      if (id) {
        this.itemId = id;
        this.loadItem(id);
      }
    });
  }

  protected abstract buildPayload(formData: any): TUpdateDto;
  protected abstract getItemLabel(item: TObject): string;
  protected abstract getItemIdParamName(): string;

  loadItem(id: string): void {
    this.isLoading = true;
    this.service.selectById(id).subscribe({
      next: (item: TObject) => {
        this.item = item;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.hasError = true;
        this.errorMessage =
          err?.error?.message ||
          this.transloco.translate("general.genericError");
        this.isLoading = false;
      },
    });
  }

  onSubmit(formData: any): void {
    const payload = this.buildPayload(formData);
    this.handleUpdate(payload);
  }

  handleUpdate(data: TUpdateDto): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = "";

    this.service.update(this.itemId, data).subscribe({
      next: async (updatedItem: TObject) => {
        await wait();

        // const dialogRef = this.dialog.open(GenericModalComponent, {
        //   disableClose: true,
        //   data: { type: "info", title: "", content: "", actions: [] },
        // });

        // this.showResultModal(
        //   dialogRef,
        //   `${this.moduleName}.update.success.title`,
        //   `${this.moduleName}.update.success.message`,
        //   this.getItemLabel(updatedItem),
        //   "info",
        //   () =>
        this.router.navigate(["../../list"], {
          relativeTo: this.route,
        });
        // );
      },
      error: async (error: any) => {
        await wait();

        this.isLoading = false;
        this.hasError = true;
        this.errorMessage =
          error?.error?.message ||
          this.transloco.translate("general.genericError");

        // const dialogRef = this.dialog.open(GenericModalComponent, {
        //   disableClose: true,
        //   data: { type: "info", title: "", content: "", actions: [] },
        // });

        // this.showResultModal(
        //   dialogRef,
        //   `${this.moduleName}.update.error.title`,
        //   `${this.moduleName}.update.error.message`,
        //   this.moduleName,
        //   "danger"
        // );
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
    this.router.navigate(["../../list"], { relativeTo: this.route });
  }
}
