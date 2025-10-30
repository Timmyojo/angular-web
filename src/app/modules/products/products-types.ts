import { BaseModel, BaseResponseInterface } from "../../@1hand/base.type";

// === CREATE ===
export interface CreateProductsDto {
  name: string;
  description?: string;
  availability: string;
  price: number;
  sale: boolean;
  tags: any[];
}

export interface Product extends BaseModel {
  name: string;
  id: number;
  description?: string;
  levels?: any[]; // Will be populated with AcademicLevel objects
}

// === UPDATE ===
export interface UpdateProductsDto {
  id: number;
  name: string;
  description?: string;
  availability?: string;
  price?: number;
  sale?: boolean;
  tags?: any[];
}

// === FILTER ===
export interface FilterProductsDto {
  name?: string;
  description?: string;
  price?: string;
  page?: number;
  limit?: number;
}

export interface ProductsFormData {
  name: string;
  description: string;
  availability: string;
  price: number;
  sale: boolean;
  tags: any[];
}

export const ProductModuleRoot = "products";
export interface ProductResponse
  extends BaseResponseInterface<Product> {}
export type ProductResponseType = BaseResponseInterface<Product>;
export type ProductDeleteDto = string;
