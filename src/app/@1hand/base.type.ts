// bases interfaces
export interface BaseModel {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BaseCreate {
  id: string;
  createdAt?: Date;
}
export interface BaseUpdate {
  id: string;
  updatedAt?: Date;
}
export interface BaseDelete {
  id: string;
  deletedAt?: Date;
}

export interface BaseResponseInterface<T> {
  page: number;
  limit: number;
  total: number;
  data: T[];
}

export interface BaseParamsQuery {
  page?: number;
  limit?: number;

  [key: string]: any;
}

export interface Media {
  id: string;
  uid: string;
  createdAt: Date | string;
  updatedAt: Date | string;

  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url?: string;

  width?: number;
  height?: number;

  uploadedById?: string;

  // Relations simplifiées pour usage frontend
  studentPhotos?: string[]; // or Student[]
  schoolLogos?: string[]; // or School[]

  deleted: boolean;
  archived: boolean;
  notes?: string;
}
