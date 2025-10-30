import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import {
  GenericFileManagerActiveTab,
  GenericFileManagerFileItem,
  GenericFileManagerModalComponent,
} from "./generic-file-manager-modal/generic-file-manager-modal.component";
import { humanSize } from "../../utils";

@Component({
  selector: "app-generic-file-manager",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./generic-file-manager.component.html",
  styleUrl: "./generic-file-manager.component.scss",
})
export class GenericFileManagerComponent implements OnChanges {
  // ======= STATE CONTRÔLÉ PAR LE PARENT (container au-dessus) =======
  @Input() files: GenericFileManagerFileItem[] = [];
  @Input() selectedFile: GenericFileManagerFileItem | null = null;
  @Input() choosedFile: GenericFileManagerFileItem | null = null;

  @Input() uploading = false;
  @Input() uploadProgress: number | null = null;
  @Input() uploadError: string | null = null;

  @Input() uploadedById = ""; // si besoin d’affichage, info méta
  @Input() activeTab: GenericFileManagerActiveTab = "library";

  @Input() enablePreview = false;

  @Input() allowedTypes: string[] = [
    "image/jpeg",
    "image/png",
    "application/pdf",
  ];
  @Input() maxSizeMB = 5;

  // ======= ÉVÉNEMENTS RE-PROPAGÉS VERS LE PARENT =======
  @Output() load = new EventEmitter<void>(); // demande de rechargement
  @Output() startUpload = new EventEmitter<File>(); // demande d’upload avec fichier
  @Output() tabChange = new EventEmitter<GenericFileManagerActiveTab>();
  @Output() select = new EventEmitter<GenericFileManagerFileItem>();
  @Output() clear = new EventEmitter<void>();
  @Output() insert = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  instance!: GenericFileManagerModalComponent;
  dialogRef!: MatDialogRef<GenericFileManagerModalComponent>;

  constructor(private dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log("Chooesdfile:", this.choosedFile);
    this.instance && this.reflectToInstance(this.instance);
  }

  openFileManager() {
    this.dialogRef = this.dialog.open(GenericFileManagerModalComponent, {
      width: "99vw",
      maxWidth: "1400px",
      maxHeight: "90vh",
      disableClose: true,
      panelClass: "file-manager-modal",
    });

    this.instance = this.dialogRef.componentInstance;

    // 1) Injecter l'état INITIAL dans la modale (enfant)
    this.reflectToInstance(this.instance);

    // 2) Re-propager les événements de l’enfant → parent (et garder la modale synchro visuelle)
    this.instance.tabChange.subscribe((tab) => {
      this.tabChange.emit(tab);
      // Option visuelle locale dans la modale (pas de logique métier)
      this.instance.activeTab = tab;
    });

    this.instance.select.subscribe((file) => {
      this.select.emit(file);
      // Option visuelle locale
      this.instance.selectedFile = file;
    });

    this.instance.clear.subscribe(() => {
      this.clear.emit();
      // Option visuelle locale
      this.instance.selectedFile = null;
    });

    // Reload demandé par l’enfant → on notifie le parent
    this.instance.reload.subscribe(() => {
      this.load.emit();
      // Le parent mettra à jour [files] en @Input ; si tu veux
      // re-synchroniser pendant que la modale est ouverte, ré-ouvre
      // ou fournis un store/Signals au-dessus.
    });

    // Start upload demandé par l’enfant → on remonte le fichier
    this.instance.startUpload.subscribe((file: File) => {
      this.startUpload.emit(file);
    });

    this.instance.cancelPending.subscribe(() => {
      this.instance.pendingFile = null;
    });

    // Drag & drop et input file émettent aussi un fichier
    this.instance.fileDropped.subscribe((file: File) => {
      this.instance.pendingFile = file;
      // this.startUpload.emit(file);
    });

    this.instance.fileSelected.subscribe((file: File) => {
      this.instance.pendingFile = file;
      // this.startUpload.emit(file);
    });

    this.instance.insert.subscribe(() => {
      console.log("emit choose");
      this.insert.emit();
      // À toi de décider si tu fermes ici ou côté parent
      this.dialogRef.close();
    });

    this.instance.close.subscribe(() => {
      this.close.emit();
      this.dialogRef.close();
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // si l’enfant décidait de close en renvoyant un fichier
        this.insert.emit();
      }
    });
  }

  reset() {
    this.clear.emit();
    this.choosedFile = null;
    this.selectedFile = null;
  }

  humanSize = humanSize;

  /** Recopie l’état (Inputs) du parent vers l’this.instance modale (UI only) */
  private reflectToInstance(instance: GenericFileManagerModalComponent) {
    instance.files = this.files;
    instance.selectedFile = this.selectedFile;
    instance.uploading = this.uploading;
    instance.uploadProgress = this.uploadProgress;
    instance.uploadError = this.uploadError;
    instance.activeTab = this.activeTab ?? "library";
    instance.allowedTypes = this.allowedTypes;
    instance.maxSizeMB = this.maxSizeMB;
  }
}
