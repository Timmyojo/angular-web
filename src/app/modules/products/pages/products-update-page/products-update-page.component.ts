import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslocoService } from "@ngneat/transloco";
import { BaseUpdatePageComponent } from "../../../../@1hand/pages/base-update-page/base-update-page.component";
import {
  ProductsFormData as FormData,
  Product as ModuleObject,
  UpdateProductsDto as ModuleObjectUpdateDto,
  ProductModuleRoot as ModuleRoot,
} from "../../products-types";
import { ProductService as Service } from "../../products-service";

@Component({
  selector: "app-academic-cycles-update-page",
  templateUrl: "./academic-cycles-update-page.component.html",
  styleUrl: "./academic-cycles-update-page.component.scss",
})
export class AcademicCyclesUpdatePageComponent extends BaseUpdatePageComponent<
  ModuleObjectUpdateDto,
  ModuleObject
> {
  moduleName = ModuleRoot;

  constructor(
    protected override service: Service,
    protected override dialog: MatDialog,
    protected override transloco: TranslocoService,
    protected override router: Router,
    protected override route: ActivatedRoute
  ) {
    super(service, dialog, transloco, router, route);
  }

  override getItemIdParamName() {
    return "sku";
  }

  override buildPayload(formData: FormData): ModuleObjectUpdateDto {
    return {
      id: this.itemId!,
      ...formData,
    };
  }

  override getItemLabel(item: ModuleObject): string {
    return item.name;
  }
}
