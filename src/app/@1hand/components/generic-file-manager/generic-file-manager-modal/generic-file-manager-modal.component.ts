import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { RouterModule } from "@angular/router";
import {
  Translation,
  TRANSLOCO_SCOPE,
  TranslocoModule,
} from "@ngneat/transloco";

export const loader: Record<string, () => Promise<Translation>> = [
  "fr",
  "en",
].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as Record<string, () => Promise<Translation>>);

export type GenericFileManagerFileItem = {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path?: string;
  url?: string;
  width?: number;
  height?: number;
  uploadedById?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type GenericFileManagerActiveTab = "library" | "upload";

@Component({
  selector: "app-generic-file-manager-modal",
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    FormsModule,
    RouterModule,
    TranslocoModule,
  ],
  providers: [
    {
      multi: true,
      provide: TRANSLOCO_SCOPE,
      useValue: {
        scope: "genericfilemanager",
        loader,
      },
    },
  ],
  templateUrl: "./generic-file-manager-modal.component.html",
  styleUrl: "./generic-file-manager-modal.component.scss",
})
export class GenericFileManagerModalComponent {
  // =========================
  // Inputs (donnés par le parent)
  // =========================
  @Input() files: GenericFileManagerFileItem[] = [];
  @Input() activeTab: GenericFileManagerActiveTab = "library";
  @Input() filters = { type: "all", date: "all", q: "" };
  @Input() selectedFile: GenericFileManagerFileItem | null = null;

  // Upload: l'état vient du parent
  @Input() pendingFile: File | null = null;
  @Input() uploading = false;
  @Input() uploadProgress: number | null = null;
  @Input() uploadError: string | null = null;

  // Config
  @Input() allowedTypes: string[] = [
    "image/jpeg",
    "image/png",
    "application/pdf",
  ];
  @Input() maxSizeMB = 5;

  // Attribut accept pour l’input file (dérivé des types autorisés)
  get acceptAttr(): string {
    return (this.allowedTypes ?? []).join(",");
  }

  // État purement visuel (UI)
  dragging = false;

  // =========================
  // Outputs (événements vers le parent)
  // =========================
  @Output() tabChange = new EventEmitter<GenericFileManagerActiveTab>();
  @Output() select = new EventEmitter<GenericFileManagerFileItem>();
  @Output() clear = new EventEmitter<void>();
  @Output() insert = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() reload = new EventEmitter<void>();
  @Output() cancelPending = new EventEmitter<void>();
  @Output() fileDropped = new EventEmitter<File>();
  @Output() fileSelected = new EventEmitter<File>();
  @Output() startUpload = new EventEmitter<File>();

  // =========================
  // Méthodes UI → événements
  // =========================
  setTab(tab: GenericFileManagerActiveTab) {
    this.tabChange.emit(tab);
  }

  selectFile(file: GenericFileManagerFileItem) {
    this.select.emit(file);
  }

  clearSelection(event: Event) {
    event.preventDefault();
    this.clear.emit();
  }

  insertSelectedFile() {
    this.insert.emit();
  }

  closeModal() {
    this.close.emit();
  }

  onReload() {
    this.reload.emit();
  }

  onCancelPending() {
    this.cancelPending.emit();
  }

  // Drag & drop (visuel + event vers parent)
  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.dragging = true;
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.dragging = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragging = false;
    const files = e.dataTransfer?.files;
    if (files && files.length) {
      this.fileDropped.emit(files[0]);
    }
  }

  onFileSelected(ev: Event) {
    if (this.uploading) return;

    const input = ev.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.fileSelected.emit(file);
      // Permet de re-sélectionner le même fichier
      input.value = "";
    }
  }

  onStartUpload(file: File | null) {
    if (file) {
      this.startUpload.emit(file);
    }
  }

  // Utils d’affichage
  getFileType(file: GenericFileManagerFileItem): "image" | "pdf" | "other" {
    if (!file?.mimetype) return "other";
    if (file.mimetype.startsWith("image/")) return "image";
    if (file.mimetype === "application/pdf") return "pdf";
    return "other";
  }

  humanSize(bytes: number) {
    if (bytes < 1024) return `${bytes} o`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} Ko`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} Mo`;
  }
}
