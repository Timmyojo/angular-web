import { Injectable } from "@angular/core";
import { HttpClient, HttpEvent, HttpEventType } from "@angular/common/http";
import { Observable, map, filter } from "rxjs";
import { BaseParamsQuery } from "../../base.type";
import { environment } from "@env/environment";

export interface GenericFileManagerUploadProgressEvent {
  type: "progress";
  progress: number; // 0..100
}

export interface GenericFileManagerUploadResponseEvent<T> {
  type: "response";
  body: T;
}

export interface MediaFile {
  id: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  originalName: string;
  filename: string;
  mimetype: string;
  size: number; // bytes
  path: string;
  url: string;
  width: number;
  height: number;
  uploadedById: string;
  deleted: boolean;
  archived: boolean;
  notes: string | null;
}

export type GenericFileManagerUploadEventUnion<T> =
  | GenericFileManagerUploadProgressEvent
  | GenericFileManagerUploadResponseEvent<T>;

@Injectable({ providedIn: "root" })
export class GenericFileManagerUploadService {
  private apiUrl = `${environment.apiUrl}/upload`;

  constructor(private http: HttpClient) {}

  selectMany(): Observable<MediaFile[]> {
    return this.http.get<MediaFile[]>(`${this.apiUrl}`);
  }

  /**
   * Upload générique avec progression.
   * @param endpoint URL d’upload (ex: '/upload')
   * @param file fichier à uploader
   * @param extraFields champs supplémentaires (ex: { uploadedById: 'user_123' })
   * @param fileFieldName nom du champ fichier (par défaut 'file')
   */
  uploadWithProgress<T>(
    endpoint: string,
    file: File,
    extraFields: Record<string, string | Blob> = {},
    fileFieldName = "file"
  ): Observable<GenericFileManagerUploadEventUnion<T>> {
    const formData = new FormData();
    formData.append(fileFieldName, file);
    for (const [key, value] of Object.entries(extraFields)) {
      formData.append(key, value);
    }

    return this.http
      .post<T>(endpoint, formData, {
        reportProgress: true,
        observe: "events",
      })
      .pipe(
        // On convertit HttpEvent -> évènements progress/response
        map(
          (
            event: HttpEvent<T>
          ): GenericFileManagerUploadEventUnion<T> | null => {
            switch (event.type) {
              case HttpEventType.Sent:
                return { type: "progress", progress: 0 };
              case HttpEventType.UploadProgress: {
                const total = event.total ?? 0;
                const progress = total
                  ? Math.round((event.loaded / total) * 100)
                  : 0;
                return { type: "progress", progress };
              }
              case HttpEventType.Response:
                return { type: "response", body: event.body as T };
              default:
                return null;
            }
          }
        ),
        // On ne renvoie que les évènements utiles
        filter((e): e is GenericFileManagerUploadEventUnion<T> => e !== null)
      );
  }
}
