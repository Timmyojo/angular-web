import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import {
  GenericFileManagerActiveTab,
  GenericFileManagerFileItem,
} from "../../components/generic-file-manager/generic-file-manager-modal/generic-file-manager-modal.component";
import { GenericFileManagerUploadService } from "../../components/generic-file-manager/generic-file-manager-upload.service";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
  selector: "app-lab",
  templateUrl: "./lab.component.html",
  styleUrl: "./lab.component.scss",
})
export class LabComponent implements OnInit {
  files: GenericFileManagerFileItem[] = [];

  selectedFile: GenericFileManagerFileItem | null = null;
  choosedFile: GenericFileManagerFileItem | null = null;

  uploading = false;
  uploadProgress: number | null = null;
  uploadError: string | null = null;

  activeTab: GenericFileManagerActiveTab = "upload";
  currentUserId = "0ec7386b-4273-4a9d-b551-b50b26ae0ed4";

  form!: FormGroup;

  fiche = {
    logoUrl: "",
    anneeUniversitaire: "2022 - 2023",
    identite: {
      matricule: "SEDJ1406010001",
      nom: "SEDEGNON",
      prenoms: "JOSUE GUY-ARNAUD",
      dateNaissance: "14-06-2001",
      lieuNaissance: "ABOBO",
      nationalite: "IVOIRIENNE",
    },
    inscription: {
      filiere: "INFORMATIQUE ET SCIENCES DU NUMERIQUE",
      niveau: "MASTER 1 - SEMESTRE 1 & 2",
      specialite: "CYBERSECURITE ET INTERNET DES OBJETS (CIO)",
      typeFormation: "FORMATION INITIALE",
    },
    paiement: {
      session: "Rentrée de septembre 2022 - 2023",
      semestre: "MASTER 1 - SEMESTRE 1 & 2",
      code: "IDK23633D9A81957EE",
      montant: "60.000 F",
      date: "26-10-2022",
    },
    qrUrl: "",
    dateEdition: "12 Janvier 2023",
  };

  constructor(
    private gfmUploadService: GenericFileManagerUploadService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.onLoadFiles();

    this.form = this.fb.group({
      content: ["<p>Texte initial</p>"],
    });
  }

  /** Chargement des fichiers depuis le backend */
  onLoadFiles() {
    // this.http.get<GenericFileManagerFileItem[]>("/upload").subscribe({
    //   next: (files) => {
    //     this.files = files;
    //     this.uploadError = null;
    //   },
    //   error: (err) => {
    //     this.uploadError = err?.error?.message || "Erreur de chargement";
    //   },
    // });

    this.files = [
      {
        id: "1",
        originalName: "photo-vacances.jpg",
        filename: "photo-vacances-1.jpg",
        mimetype: "image/jpeg",
        size: 245678,
        path: "/uploads/images/photo-vacances-1.jpg",
        url: "https://picsum.photos/id/1015/640/426",
        width: 640,
        height: 426,
        uploadedById: "user_123",
        createdAt: new Date("2024-07-15T10:30:00"),
        updatedAt: new Date("2024-07-15T11:00:00"),
      },
      {
        id: "2",
        originalName: "rapport-annuel.pdf",
        filename: "rapport-annuel-2024.pdf",
        mimetype: "application/pdf",
        size: 1024560,
        path: "/uploads/docs/rapport-annuel-2024.pdf",
        url: "https://via.placeholder.com/150x200.png?text=PDF",
        uploadedById: "user_456",
        createdAt: new Date("2024-05-02T14:00:00"),
        updatedAt: new Date("2024-05-03T09:00:00"),
      },
      {
        id: "3",
        originalName: "presentation-projet.pptx",
        filename: "presentation-projet-v2.pptx",
        mimetype:
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        size: 2048576,
        path: "/uploads/presentations/presentation-projet-v2.pptx",
        url: "https://via.placeholder.com/150x200.png?text=PPT",
        uploadedById: "user_789",
        createdAt: new Date("2024-08-01T09:45:00"),
        updatedAt: new Date("2024-08-01T10:15:00"),
      },
      {
        id: "4",
        originalName: "tableau-finances.xlsx",
        filename: "tableau-finances-2024.xlsx",
        mimetype:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 754321,
        path: "/uploads/excel/tableau-finances-2024.xlsx",
        url: "https://via.placeholder.com/150x200.png?text=XLSX",
        uploadedById: "user_123",
        createdAt: new Date("2024-06-20T16:15:00"),
        updatedAt: new Date("2024-06-20T16:30:00"),
      },
      {
        id: "5",
        originalName: "portrait-utilisateur.png",
        filename: "portrait-utilisateur.png",
        mimetype: "image/png",
        size: 512678,
        path: "/uploads/avatars/portrait-utilisateur.png",
        url: "https://picsum.photos/id/1005/640/640",
        width: 640,
        height: 640,
        uploadedById: "user_555",
        createdAt: new Date("2024-07-28T18:30:00"),
        updatedAt: new Date("2024-07-28T18:45:00"),
      },
      {
        id: "6",
        originalName: "video-promo.mp4",
        filename: "video-promo.mp4",
        mimetype: "video/mp4",
        size: 50485760,
        path: "/uploads/videos/video-promo.mp4",
        url: "https://via.placeholder.com/150x200.png?text=MP4",
        uploadedById: "user_222",
        createdAt: new Date("2024-07-10T12:00:00"),
        updatedAt: new Date("2024-07-10T12:10:00"),
      },
      {
        id: "7",
        originalName: "guide-utilisation.docx",
        filename: "guide-utilisation-v1.docx",
        mimetype:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 345678,
        path: "/uploads/docs/guide-utilisation-v1.docx",
        url: "https://via.placeholder.com/150x200.png?text=DOCX",
        uploadedById: "user_333",
        createdAt: new Date("2024-05-25T11:00:00"),
        updatedAt: new Date("2024-05-25T11:15:00"),
      },
      {
        id: "8",
        originalName: "logo-entreprise.svg",
        filename: "logo-entreprise.svg",
        mimetype: "image/svg+xml",
        size: 12678,
        path: "/uploads/logos/logo-entreprise.svg",
        url: "https://upload.wikimedia.org/wikipedia/commons/0/02/SVG_logo.svg",
        width: 200,
        height: 200,
        uploadedById: "user_999",
        createdAt: new Date("2024-08-05T08:15:00"),
        updatedAt: new Date("2024-08-05T08:16:00"),
      },
      {
        id: "9",
        originalName: "flyer-evenement.jpeg",
        filename: "flyer-evenement-2024.jpeg",
        mimetype: "image/jpeg",
        size: 312456,
        path: "/uploads/flyers/flyer-evenement-2024.jpeg",
        url: "https://picsum.photos/id/1024/640/480",
        width: 640,
        height: 480,
        uploadedById: "user_111",
        createdAt: new Date("2024-06-12T14:25:00"),
        updatedAt: new Date("2024-06-12T14:40:00"),
      },
      {
        id: "10",
        originalName: "brochure-produit.pdf",
        filename: "brochure-produit.pdf",
        mimetype: "application/pdf",
        size: 1987654,
        path: "/uploads/docs/brochure-produit.pdf",
        url: "https://via.placeholder.com/150x200.png?text=PDF",
        uploadedById: "user_444",
        createdAt: new Date("2024-07-05T17:40:00"),
        updatedAt: new Date("2024-07-05T18:00:00"),
      },
    ];

    this.choosedFile = this.files[0];
    this.activeTab = "library";

    console.log("**********load the file");
  }

  onStartUpload(file: File) {
    this.uploading = true;
    this.uploadProgress = 0;
    this.uploadError = null;
    this.gfmUploadService
      .uploadWithProgress<GenericFileManagerFileItem>(
        "http://localhost:8800/upload",
        file,
        {
          uploadedById: this.currentUserId,
        }
      )
      .subscribe({
        next: (evt) => {
          console.log("eveevvvv: ", evt);
          if (evt.type === "progress") {
            this.uploadProgress = evt.progress;
          } else {
            // success
            const newFile = evt.body;
            this.files = [newFile, ...this.files];
            this.selectedFile = newFile;
            this.uploading = false;
            this.uploadProgress = null;
            this.activeTab = "library";
          }
        },
        error: (err) => {
          // ⬅️ 404, 500, CORS, ou Validation throw -> ici.
          this.uploading = false;
          this.uploadProgress = null;
          this.uploadError =
            err?.error?.message ||
            err?.message ||
            `Échec de l’upload (${err?.status || "?"})`;
        },
      });
  }

  /** Quand un fichier est inséré */
  onInsert() {
    console.log("Fichier choisi :", this.selectedFile);
    this.choosedFile = this.selectedFile;
  }

  /** Quand la modale est fermée */
  onClose() {
    console.log("Modale fermée");
  }

  onEditorChange(data: any) {
    console.log("Data: ", data);
  }
}
