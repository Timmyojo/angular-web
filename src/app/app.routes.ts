import { Routes } from '@angular/router';

export const routes: Routes = [
    {
    path: "",
    loadChildren: () =>
      import("./modules/products/products-module").then((m) => m.ProductsModule),
  }
];
