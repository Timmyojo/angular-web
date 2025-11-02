import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router, ActivatedRoute } from "@angular/router";
import { TranslocoService } from "@ngneat/transloco";
import { BaseCreatePageComponent } from "../../../../@1hand/pages/base-create-page/base-create-page.component";
import {
  CreateProductsDto as ModuleObjectCreateDto,
  Product as ModuleObject,
  ProductsFormData as ModuleObjectFormData,
  ProductModuleRoot as ModuleRoot,
} from "../../products-types";
import { ProductService as Service } from "../../products-service";
// import { UrlManagerService } from "@modules/core/services/url-manager.service";

@Component({
  selector: "app-products-create-page",
  templateUrl: "./products-create-page.component.html",
  styleUrl: "./products-create-page.component.scss",
})
export class ProductCreatePageComponent
  extends BaseCreatePageComponent<ModuleObjectCreateDto, ModuleObject>
  implements OnInit
{
  moduleName = ModuleRoot;
  private id: string = "";

  constructor(
    protected override service: Service,
    protected override dialog: MatDialog,
    protected override transloco: TranslocoService,
    protected override router: Router,
    protected override route: ActivatedRoute,
    // private urlManager: UrlManagerService,
    // private academicYearsService: AcademicYearsService
  ) {
    super(service, dialog, transloco, router, route);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }


  override onInitParams(): void {
    // Custom parameter initialization if needed
  }

  override buildPayload(formData: ModuleObjectFormData): ModuleObjectCreateDto {
    return {
      ...formData,
    };
  }

  override getItemLabel(item: ModuleObject): string {
    return `${item.name}`;
  }
}
