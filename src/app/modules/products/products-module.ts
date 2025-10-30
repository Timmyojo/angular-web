import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing-module';
import { ProductList } from './components/product-list/product-list';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ProductList,
    ProductsRoutingModule
  ]
})
export class ProductsModule { }
