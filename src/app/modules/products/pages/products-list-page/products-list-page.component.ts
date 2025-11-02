import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslocoService } from "@ngneat/transloco";
import { BaseListPageComponent } from "../../../../@1hand/pages/base-list-page/base-list-page.component";
import {
  Product as ModuleObject,
  FilterProductsDto,
} from "../../products-types";
import { ProductService as Service } from "../../products-service";
// import { UrlManagerService } from "@modules/core/services/url-manager.service";
import { Subject, debounceTime, takeUntil } from "rxjs";

@Component({
  selector: "app-products-list-page",
  templateUrl: "./products-list-page.component.html",
  styleUrl: "./products-list-page.component.scss",
})
export class ProductListPageComponent
  extends BaseListPageComponent<ModuleObject>
  implements OnInit, OnDestroy
{
  // Filtres
  filters = {
    search: "",
    description: "",
  };

  moduleName = "products";

  // Subjects pour la recherche en temps réel
  private searchSubject = new Subject<string>();
  private descriptionFilterSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    service: Service,
    route: ActivatedRoute,
    transloco: TranslocoService,
    router: Router,
    dialog: MatDialog,
    // private urlManager: UrlManagerService
  ) {
    super(service, route, router, transloco);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.setupRealTimeSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupRealTimeSearch(): void {
    // Configuration de la recherche en temps réel pour le champ de recherche
    this.searchSubject
      .pipe(
        debounceTime(300), // Attendre 300ms après la dernière frappe
        takeUntil(this.destroy$) // Se désabonner quand le composant est détruit
      )
      .subscribe((searchTerm) => {
        this.filters.search = searchTerm;
        this.page = 1; // Revenir à la première page
        this.updateQueryParams();
      });

    // Configuration pour le filtre de description
    this.descriptionFilterSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((description) => {
        this.filters.description = description;
        this.page = 1;
        this.updateQueryParams();
      });
  }

  protected onParamsInit(params: any): void {
    // Initialiser les filtres depuis les paramètres de l'URL
    this.filters.search = params["search"] || "";
    this.filters.description = params["description"] || "";
  }

  protected getListParams(): any {
    // const schoolId = this.urlManager.getSchoolIdFromUrl();
    const params: FilterProductsDto = {
      page: this.page,
      limit: this.limit,
      description: this.filters.description,
    };

    // Ajouter les filtres actifs
    if (this.filters.search.trim()) {
      params.name = this.filters.search.trim();
    }
    if (this.filters.description.trim()) {
      params.description = this.filters.description.trim();
    }

    return params;
  }

  protected getItemId(item: ModuleObject): string {
    return item.id;
  }

  protected getItemLabel(item: ModuleObject): string {
    return item.name;
  }

  protected getDeleteTitle(item: ModuleObject): string {
    return this.transloco.translate(`${this.moduleName}.delete.title`, {
      name: item.name,
    });
  }

  protected getDeleteMessage(item: ModuleObject): string {
    return this.transloco.translate(`${this.moduleName}.delete.message`, {
      name: item.name,
    });
  }

  onApplyFilters(): void {
    this.page = 1;
    this.updateQueryParams();
    this.loadItems(); // Relancer la requête avec les nouveaux filtres
  }

  onResetFilters(): void {
    this.filters = {
      search: "",
      description: "",
    };
    this.page = 1;

    // Déclencher les subjects pour mettre à jour l'URL via la recherche en temps réel
    this.searchSubject.next("");
    this.descriptionFilterSubject.next("");
  }

  // Méthodes pour déclencher la recherche en temps réel
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  onDescriptionFilterChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.descriptionFilterSubject.next(target.value);
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.updateQueryParams();
  }

  protected override updateQueryParams(): void {
    const queryParams: any = {
      page: this.page,
      limit: this.limit,
    };

    // Ajouter tous les filtres (même vides pour les supprimer de l'URL)
    Object.keys(this.filters).forEach((key) => {
      const value = (this.filters as any)[key];
      if (value && value.trim && value.trim()) {
        queryParams[key] = value;
      } else if (value && !value.trim) {
        queryParams[key] = value;
      } else {
        // Explicitement définir comme null pour supprimer le paramètre de l'URL
        queryParams[key] = null;
      }
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: "replace", // Remplacer tous les paramètres au lieu de les fusionner
    });
  }

  handleCreate() {
    this.router.navigate(["../create"], { relativeTo: this.route });
  }

  handleView(item: ModuleObject) {
    this.router.navigate(["../", item.id], { relativeTo: this.route });
  }

  handleUpdate(item: ModuleObject) {
    this.router.navigate(["./../edit", item.id], { relativeTo: this.route });
  }

  handleDelete(item: ModuleObject) {
    // Implémentation de la suppression si nécessaire
    console.log("Delete academic cycle:", item);
  }
}
