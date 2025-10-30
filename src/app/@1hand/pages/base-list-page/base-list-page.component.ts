import { Directive, OnInit } from "@angular/core";
import { TranslocoService } from "@ngneat/transloco";
import { ActivatedRoute, Router } from "@angular/router";
import { wait } from "../../utils";

@Directive()
export abstract class BaseListPageComponent<T> implements OnInit {
  items: T[] = [];

  errorMessage = "";
  isLoading = false;
  hasError = false;

  page = 1;
  limit = 10;
  totalItems = 0;
  totalPages = 0;

  constructor(
    protected service: any,
    protected route: ActivatedRoute,
    protected router: Router,
    protected transloco: TranslocoService
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
  protected abstract getListParams(): any;

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
}
