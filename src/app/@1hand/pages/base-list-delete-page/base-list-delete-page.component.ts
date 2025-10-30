import { Directive, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { TranslocoService } from "@ngneat/transloco";
import { ActivatedRoute, Router } from "@angular/router";
import {
  GenericModalComponent,
  GenericModalData,
  GenericModalType,
} from "../../components/generic-modal/generic-modal.component";
import { wait } from "../../utils";

@Directive()
export abstract class BaseListDeletePageComponent<T> implements OnInit {
  items: T[] = [];

  errorMessage = "";
  isLoading = false;
  hasError = false;

  isLoadingDelete = false;

  page = 1;
  limit = 10;
  totalItems = 0;
  totalPages = 0;

  abstract moduleName: string;

  constructor(
    protected service: any,
    protected route: ActivatedRoute,
    protected router: Router,
    protected transloco: TranslocoService,
    protected dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.page = params["page"] ? +params["page"] : 1;
      this.limit = params["limit"] ? +params["limit"] : 10;
      this.onParamsInit(params);
      this.loadItems();
    });
  }

  protected abstract onParamsInit(params: any): void;

  protected abstract getDeleteTitle(item: T): string;
  protected abstract getDeleteMessage(item: T): string;
  protected abstract getItemId(item: T): string;

  protected loadItems(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = "";

    this.service.selectMany(this.getListParams()).subscribe({
      next: async (res: any) => {
        await wait();
        this.items = res.data;
        this.totalItems = res.total;
        this.totalPages = Math.ceil(res.total / this.limit);
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.errorMessage = this.transloco.translate("genericError");
        this.isLoading = false;
      },
    });
  }

  protected abstract getListParams(): any;

  handleDelete(item: T): void {
    const dialogRef = this.openDeleteModal(item);

    const sub = dialogRef.componentInstance.action.subscribe(async (result) => {
      if (result !== "confirm") {
        dialogRef.close();
        sub.unsubscribe();
        // if (result === "ok") this.loadItems();
        return;
      }

      // this.isLoadingDelete = true;
      // this.hasError = true;
      // this.errorMessage = "";

      const confirmAction = dialogRef.componentInstance.data?.actions?.find(
        (a) => a.id === "confirm"
      );
      if (confirmAction) confirmAction.isLoading = true;

      await wait();

      this.service.delete(this.getItemId(item)).subscribe({
        next: async () => {
          await wait();

          // this.isLoadingDelete = false;
          // this.hasError = false;
          // this.errorMessage = "";

          this.showResultModal(
            dialogRef,
            `${this.moduleName}.delete.success.title`,
            `${this.moduleName}.delete.success.message`,
            this.getItemLabel(item),
            "info",
            () => this.loadItems()
          );
        },
        error: async (error: any) => {
          await wait();

          // this.hasError = true;
          // this.isLoadingDelete = false;
          this.errorMessage =
            error?.error?.message ||
            this.transloco.translate("general.genericError");

          this.showResultModal(
            dialogRef,
            `${this.moduleName}.delete.error.title`,
            // `${this.moduleName}.delete.error.message`,
            (this.errorMessage =
              error?.error?.message ||
              this.transloco.translate("general.genericError")),
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
    messageKey: string,
    name: string,
    type: GenericModalType = "info",
    cb?: Function
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
        if (cb) cb();
      }
    });
  }

  protected updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.page,
        limit: this.limit,
      },
      queryParamsHandling: "merge",
    });
  }

  protected abstract getItemLabel(item: T): string;
}
