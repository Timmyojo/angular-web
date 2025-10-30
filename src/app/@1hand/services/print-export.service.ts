import { Injectable } from "@angular/core";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { environment } from "@env/environment";
import { School } from "@modules/schools/schools.types";

export interface PrintColumn {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
  format?: (value: any) => string;
}

export interface PrintConfig {
  title: string;
  school: School;
  subtitle?: string;
  columns: PrintColumn[];
  data: any[];
  headerInfo?: { label: string; value: string }[];
  showDate?: boolean;
  showPageNumbers?: boolean;
  customStyles?: string;
  useOfficialHeader?: boolean;
  logoUrl?: string;
  institutionInfo?: {
    leftBlock: {
      country: string;
      motto: string;
      ministry: string;
      institution: string;
      faculty: string;
    };
    rightBlock: {
      country: string;
      motto: string;
      ministry: string;
      institution: string;
      faculty: string;
    };
  };
}

export interface ClassTableData {
  classTitle: string; // Ex: "Structure › Cycle › Niveau › Classe"
  students: any[];
}

export interface MultiTablePrintConfig {
  title: string;
  school: School;
  subtitle?: string;
  columns: PrintColumn[];
  classTables: ClassTableData[];
  headerInfo?: { label: string; value: string }[];
  showDate?: boolean;
  showPageNumbers?: boolean;
  customStyles?: string;
}

@Injectable({
  providedIn: "root",
})
export class PrintExportService {
  constructor() {}

  /**
   * Imprime une liste de données avec une configuration personnalisée
   */
  async printList(config: PrintConfig): Promise<void> {
    if (!config.data || config.data.length === 0) {
      console.warn("Aucune donnée à imprimer");
      return;
    }

    if (config.logoUrl) {
      config.logoUrl = await this.convertImagePathToBase64(config.logoUrl);
    }

    const printContent = this.generatePrintContent(config);
    this.openPrintWindow(printContent);
  }

  /**
   * Exporte les données en CSV
   */
  exportToCSV(config: PrintConfig, filename?: string): void {
    if (!config.data || config.data.length === 0) {
      console.warn("Aucune donnée à exporter");
      return;
    }

    const csvContent = this.generateCSVContent(config);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        filename || `${config.title.replace(/\s+/g, "_")}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Exporte les données en PDF
   */
  async exportToPDF(config: PrintConfig, filename?: string): Promise<void> {
    if (!config.data || config.data.length === 0) {
      console.warn("Aucune donnée à exporter");
      return;
    }

    try {
      if (config.logoUrl) {
        config.logoUrl = await this.convertImagePathToBase64(config.logoUrl);
      }

      const printContent = this.generatePrintContent(config);

      // Créer un élément temporaire pour le contenu HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = printContent;
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "-9999px";
      tempDiv.style.width = "210mm"; // Format A4
      tempDiv.style.backgroundColor = "white";
      document.body.appendChild(tempDiv);

      // Attendre un peu pour que le contenu soit rendu
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Convertir le HTML en canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
      });

      // Supprimer l'élément temporaire
      document.body.removeChild(tempDiv);

      // Créer le PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");

      // Définir les marges (en mm)
      const marginTop = 8;
      const marginBottom = 8;
      const marginLeft = 8;
      const marginRight = 8;

      // Dimensions utiles après marges
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const usableWidth = pageWidth - marginLeft - marginRight;
      const usableHeight = pageHeight - marginTop - marginBottom;

      // Calculer les dimensions de l'image en tenant compte des marges
      const imgWidth = usableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = marginTop;

      // Ajouter la première page
      pdf.addImage(imgData, "PNG", marginLeft, position, imgWidth, imgHeight);
      heightLeft -= usableHeight;

      // Ajouter des pages supplémentaires si nécessaire
      while (heightLeft >= 0) {
        position = marginTop - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, "PNG", marginLeft, position, imgWidth, imgHeight);
        heightLeft -= usableHeight;
      }

      // Télécharger le PDF
      const finalFilename =
        filename || `${config.title.replace(/\s+/g, "_")}.pdf`;
      pdf.save(finalFilename);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      // Fallback vers la méthode d'impression classique
      this.fallbackToPrint(config);
    }
  }

  /**
   * Exporte plusieurs tableaux (un par classe) en PDF
   */
  async exportMultipleTablesToPDF(
    config: MultiTablePrintConfig,
    filename?: string
  ): Promise<void> {
    if (!config.classTables || config.classTables.length === 0) {
      console.warn("Aucune donnée à exporter");
      return;
    }

    try {
      const printContent = this.generateMultiTablePrintContent(config);

      // Créer un iframe isolé pour éviter les conflits de style
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.left = "-9999px";
      iframe.style.top = "-9999px";
      iframe.style.width = "210mm"; // Format A4
      iframe.style.height = "auto";
      iframe.style.border = "none";
      iframe.style.backgroundColor = "white";

      document.body.appendChild(iframe);

      // Attendre que l'iframe soit prêt
      await new Promise((resolve) => {
        iframe.onload = resolve;
        iframe.src = "about:blank";
      });

      // Écrire le contenu dans l'iframe
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error("Impossible d'accéder au document de l'iframe");
      }

      iframeDoc.open();
      iframeDoc.write(printContent);
      iframeDoc.close();

      // Attendre que tout le contenu soit bien rendu (augmenter le délai)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Calculer la hauteur réelle du contenu
      const contentHeight = iframeDoc.body.scrollHeight;

      // Vérifier que le contenu a une hauteur valide
      if (contentHeight <= 0) {
        throw new Error("Le contenu à exporter est vide");
      }

      // Convertir le contenu de l'iframe en canvas avec des options optimisées
      const canvas = await html2canvas(iframeDoc.body, {
        scale: 1.5, // Réduire l'échelle pour éviter les problèmes de mémoire
        useCORS: true,
        allowTaint: true, // Autoriser les ressources externes
        backgroundColor: "#ffffff",
        logging: false,
        width: 794, // A4 width in pixels at 96 DPI
        height: contentHeight,
        windowWidth: 794,
        windowHeight: contentHeight,
        imageTimeout: 0,
      });

      // Supprimer l'iframe
      document.body.removeChild(iframe);

      // Vérifier que le canvas est valide
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Le canvas généré est vide");
      }

      // Créer le PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Convertir le canvas en image JPEG (plus fiable que PNG)
      let imgData: string;
      try {
        imgData = canvas.toDataURL("image/jpeg", 0.95);

        // Vérifier que l'image est valide
        if (!imgData || imgData === "data:," || imgData.length < 100) {
          // Si JPEG échoue, essayer PNG
          imgData = canvas.toDataURL("image/png");
        }

        if (!imgData || imgData === "data:," || imgData.length < 100) {
          throw new Error("Impossible de générer l'image");
        }
      } catch (error) {
        console.error("Erreur lors de la conversion canvas->image:", error);
        throw new Error("Erreur de conversion du canvas en image");
      }

      // Définir les marges (en mm)
      const marginTop = 8;
      const marginBottom = 8;
      const marginLeft = 8;
      const marginRight = 8;

      // Dimensions utiles après marges
      const pageWidth = 210;
      const pageHeight = 297;
      const usableWidth = pageWidth - marginLeft - marginRight;
      const usableHeight = pageHeight - marginTop - marginBottom;

      // Calculer les dimensions de l'image
      const imgWidth = usableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = marginTop;

      // Déterminer le format d'image (JPEG ou PNG)
      const imageFormat = imgData.startsWith("data:image/jpeg")
        ? "JPEG"
        : "PNG";

      // Ajouter la première page
      pdf.addImage(imageFormat, marginLeft, position, imgWidth, imgHeight);
      heightLeft -= usableHeight;

      // Ajouter des pages supplémentaires si nécessaire
      while (heightLeft >= 0) {
        position = marginTop - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(
          imgData,
          imageFormat,
          marginLeft,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= usableHeight;
      }

      // Télécharger le PDF
      const finalFilename =
        filename || `${config.title.replace(/\s+/g, "_")}.pdf`;
      pdf.save(finalFilename);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      alert(
        `Une erreur est survenue lors de la génération du PDF:\n${errorMessage}\n\nVeuillez réessayer ou utiliser la fonction d'impression.`
      );
    }
  }

  /**
   * Génère le contenu HTML pour plusieurs tableaux
   */
  private generateMultiTablePrintContent(
    config: MultiTablePrintConfig
  ): string {
    const currentDate = new Date().toLocaleDateString("fr-FR");
    const currentTime = new Date().toLocaleTimeString("fr-FR");

    // Génération des informations d'en-tête
    let headerInfoHtml = "";
    if (config.headerInfo && config.headerInfo.length > 0) {
      const infoItems = config.headerInfo
        .map(
          (info) => `
        <div>
          <div class="label">${info.label}</div>
          <div class="value">${info.value}</div>
        </div>
      `
        )
        .join("");

      headerInfoHtml = `
        <div class="header-info">
          ${infoItems}
        </div>
      `;
    }

    // Génération des en-têtes de colonnes
    const tableHeaders = config.columns
      .map(
        (col) => `
      <th style="
        background-color: #f8f9fa;
        padding: 8px;
        text-align: ${col.align || "left"};
        border: 1px solid #dee2e6;
        font-weight: bold;
        font-size: 10px;
        ${col.width ? `width: ${col.width};` : ""}
      ">
        ${col.label}
      </th>
    `
      )
      .join("");

    // Génération de tous les tableaux de classes
    const classTablesHtml = config.classTables
      .map((classTable) => {
        const tableRows = classTable.students
          .map((student) => {
            const cells = config.columns
              .map((col) => {
                let value = this.getNestedValue(student, col.key);
                if (col.format && typeof col.format === "function") {
                  value = col.format(value);
                }
                return `
              <td style="
                border: 1px solid #dee2e6;
                padding: 6px;
                font-size: 9px;
                text-align: ${col.align || "left"};
              ">
                ${value || "-"}
              </td>
            `;
              })
              .join("");

            return `<tr>${cells}</tr>`;
          })
          .join("");

        return `
          <div class="class-section" style="margin-bottom: 30px; page-break-inside: avoid;">
            <div class="class-header" style="
              background: linear-gradient(to right, #e3f2fd, #bbdefb);
              border: 1px solid #90caf9;
              padding: 10px;
              margin-bottom: 10px;
              border-radius: 5px;
            ">
              <h3 style="margin: 0; font-size: 12px; color: #1976d2;">
                <i class="fas fa-sitemap" style="margin-right: 8px;"></i>
                ${classTable.classTitle}
              </h3>
              <span style="font-size: 10px; color: #666;">
                ${classTable.students.length} élève(s)
              </span>
            </div>
            
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>${tableHeaders}</tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
        `;
      })
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${config.title}</title>
        <style>
          html, body {
            font-family: Arial, sans-serif;
            color: #000;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 20px;
            color: #333;
          }
          .header h2 {
            color: #666;
            margin: 5px 0;
            font-size: 14px;
            font-weight: normal;
          }
          .header-info {
            display: flex;
            justify-content: space-around;
            margin-bottom: 20px;
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            flex-wrap: wrap;
          }
          .header-info > div {
            text-align: center;
            margin: 5px;
          }
          .header-info .label {
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
            color: #666;
          }
          .header-info .value {
            font-size: 14px;
            margin-top: 5px;
            color: #333;
          }
          .class-section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .class-header {
            background: linear-gradient(to right, #e3f2fd, #bbdefb);
            border: 1px solid #90caf9;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 5px;
          }
          .class-header h3 {
            margin: 0;
            font-size: 12px;
            color: #1976d2;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #dee2e6;
            padding: 6px;
          }
          th {
            background-color: #f8f9fa;
            font-weight: bold;
            font-size: 10px;
          }
          td {
            font-size: 9px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 11px;
            border-top: 1px solid #dee2e6;
            padding-top: 15px;
            color: #666;
          }
          @media print {
            body { margin: 0; padding: 10px; }
            .header { page-break-after: avoid; }
            .class-section { page-break-inside: avoid; }
            table { page-break-inside: avoid; }
          }
          ${config.customStyles || ""}
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${config.title}</h1>
          ${config.subtitle ? `<h2>${config.subtitle}</h2>` : ""}
        </div>

        ${headerInfoHtml}

        ${classTablesHtml}

        ${
          config.showDate !== false
            ? `
          <div class="footer">
            Généré le ${currentDate} à ${currentTime}
          </div>
        `
            : ""
        }
      </body>
      </html>
    `;
  }

  /**
   * Méthode de fallback en cas d'erreur lors de la génération PDF
   */
  private fallbackToPrint(config: PrintConfig): void {
    const printContent = this.generatePrintContent(config);
    const printWindow = window.open("", "_blank", "width=800,height=600");

    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.print();
        // Note: L'utilisateur devra choisir "Enregistrer au format PDF" dans la boîte de dialogue d'impression
      };
    } else {
      console.error(
        "Impossible d'ouvrir la fenêtre d'impression. Vérifiez que les pop-ups ne sont pas bloqués."
      );
    }
  }

  // private async convertImagePathToBase64(imagePath: string): Promise<string> {
  //   try {
  //     console.log("paht: ", imagePath);
  //     const response = await fetch(imagePath);
  //     const blob = await response.blob();
  //     return new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onloadend = () => resolve(reader.result as string);
  //       reader.onerror = reject;
  //       reader.readAsDataURL(blob);
  //     });
  //   } catch (error) {
  //     console.warn("Logo not found, using default");
  //     // Return a default base64 image or empty string
  //     return "";
  //   }
  // }

  private async convertImagePathToBase64(imagePath: string): Promise<string> {
    try {
      const response = await fetch(imagePath, { mode: "cors" });
      if (!response.ok) throw new Error("Image HTTP error");

      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Si c’est un PNG, le convertir en JPEG (pour éviter les soucis PDF)
      if (base64.startsWith("data:image/png")) {
        return await new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = base64;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.fillStyle = "#FFFFFF";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL("image/jpeg", 0.9));
            } else {
              resolve(base64);
            }
          };
          img.onerror = () =>
            reject(new Error("Impossible de charger l’image PNG"));
        });
      }

      return base64;
    } catch (err) {
      console.error("Erreur logo:", err);
      return "";
    }
  }

  /**
   * Génère le contenu HTML pour l'impression
   */
  private generatePrintContent(config: PrintConfig): string {
    const currentDate = new Date().toLocaleDateString("fr-FR");
    const currentTime = new Date().toLocaleTimeString("fr-FR");

    // Génération de l'en-tête officiel
    let officialHeaderHtml = "";
    if (config.useOfficialHeader && config.institutionInfo) {
      // config.logoUrl ||
      const logoUrl = config.logoUrl ?? "";

      // alert("generate");
      console.log("LOGO URL: ", logoUrl);

      officialHeaderHtml = `
        <section class="official-header">
          <div class="header-grid">
            <!-- Bloc gauche (FR) -->
            <div class="left-block">
              <p class="country">${config.institutionInfo.leftBlock.country}</p>
              <p class="motto">${config.institutionInfo.leftBlock.motto}</p>
              <p class="ministry">${config.institutionInfo.leftBlock.ministry}</p>
              <!-- <p class="institution">${config.institutionInfo.leftBlock.institution}</p> 
              <div class="separator"></div>
              <p class="faculty">${config.institutionInfo.leftBlock.faculty}</p>-->
              <p>${config.school?.address} TEL. ${config.school?.phoneNumber.internationalNumber}</p>
            </div>

            <!-- Logo au centre -->
            <div class="logo-center">
              <img src="${logoUrl}" alt="Logo" class="logo" />
            </div>

            <!-- Bloc droit (EN) -->
            <div class="right-block">
              <p class="country">${config.institutionInfo.rightBlock.country}</p>
              <p class="motto">${config.institutionInfo.rightBlock.motto}</p>
              <p class="ministry">${config.institutionInfo.rightBlock.ministry}</p>
              <!-- <p class="institution">${config.institutionInfo.rightBlock.institution}</p> 
              <div class="separator"></div>
              <p class="faculty">${config.institutionInfo.rightBlock.faculty}</p> -->
                 <p>${config.school?.address} TEL. ${config.school?.phoneNumber.internationalNumber}</p>
            </div>
          </div>

          <div>
            <h1 style="text-align: center; width: 100%">${config.institutionInfo.leftBlock.institution}</h1>
          </div>
        </section>
      `;
    }

    // Génération des informations d'en-tête
    let headerInfoHtml = "";
    if (config.headerInfo && config.headerInfo.length > 0) {
      const infoItems = config.headerInfo
        .map(
          (info) => `
        <div>
          <div class="label">${info.label}</div>
          <div class="value">${info.value}</div>
        </div>
      `
        )
        .join("");

      headerInfoHtml = `
        <div class="header-info">
          ${infoItems}
        </div>
      `;
    }

    // Génération des en-têtes de colonnes
    const tableHeaders = config.columns
      .map(
        (col) => `
      <th style="
        background-color: #fff;
        padding: 12px 8px;
        text-align: ${col.align || "left"};
        border: 1px solid #0008;
        font-weight: bold;
        ${col.width ? `width: ${col.width};` : ""}
      ">
        ${col.label}
      </th>
    `
      )
      .join("");

    // Génération des lignes de données
    const tableRows = config.data
      .map((item, index) => {
        const cells = config.columns
          .map((col) => {
            let value = this.getNestedValue(item, col.key);
            if (col.format && typeof col.format === "function") {
              value = col.format(value);
            }
            return `
          <td style="
            border: 1px solid #0008;
            padding: 8px;
            color: #000;
            text-align: ${col.align || "left"};
          ">
            ${value || "N/A"}
          </td>
        `;
          })
          .join("");

        return `<tr>${cells}</tr>`;
      })
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${config.title}</title>
        <style>
          html, body {
            font-family: Arial, sans-serif;
            color: #000;
            line-height: 1.4;
          }
          table.export-template th, table.export-template td {
            font-size: 10px; /* Tableau plus lisible */
          }
          .header h1 {
            margin: 0;
            font-size: 18px; /* titre principal réduit */
          }
          .header h2 {
            margin: 5px 0;
            font-size: 14px; /* sous-titre réduit */
          }
          .official-header {
            margin: 0 auto;
          }
          .header-grid {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: start;
            padding: 10px 0;
          }
          .left-block {
            width: fit-content;
            font-size: 14px;
            text-align: center;
            line-height: 1.1;
          }
          .left-block .country {
            font-weight: bold;
            margin: 0 0 2px 0;
          }
          .left-block .motto {
            font-style: italic;
            margin: 0 0 12px 0;
          }
          .left-block .ministry {
            font-weight: bold;
            margin: 0 0 12px 0;
          }
          .left-block .institution {
            font-weight: 800;
            text-transform: uppercase;
            margin: 0 0 4px 0;
          }
          .left-block .separator {
            height: 2px;
            width: 56px;
            background-color: black;
            margin: 4px 0;
          }
          .left-block .faculty {
            font-weight: bold;
            text-transform: uppercase;
            margin: 4px 0 0 0;
          }
          .logo-center {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
          }
          .logo {
            width: 64px;
            height: 64px;
            object-fit: contain;
          }
          .right-block {
            width: fit-content;
            font-size: 14px;
            margin-left: auto;
            line-height: 1.1;
            text-align: center;
          }
          .right-block .country {
            font-weight: bold;
            margin: 0 0 2px 0;
          }
          .right-block .motto {
            font-style: italic;
            margin: 0 0 12px 0;
          }
          .right-block .ministry {
            font-weight: bold;
            margin: 0 0 12px 0;
          }
          .right-block .institution {
            font-weight: 800;
            text-transform: uppercase;
            margin: 0 0 4px 0;
          }
          .right-block .separator {
            height: 2px;
            width: 56px;
            background-color: black;
            margin: 4px 0 4px auto;
          }
          .right-block .faculty {
            font-weight: bold;
            text-transform: uppercase;
            margin: 4px 0 0 0;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #fff;
            padding-bottom: 10px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .header h2 {
            color: #0008;
            margin: 5px 0;
            font-size: 18px;
            font-weight: normal;
          }
          .header-info {
            display: flex;
            justify-content: space-around;
            margin-bottom: 10px;
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            flex-wrap: wrap;
          }
          .header-info > div {
            text-align: center;
            margin: 5px;
          }
          .header-info .label {
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
          }
          .header-info .value {
            font-size: 16px;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            border-top: 1px solid #0008;
            padding-top: 10px;
          }
          .summary {
            margin-top: 20px;
            text-align: right;
            font-weight: bold;
          }
          @media print {
            body { margin: 0; }
            .official-header { page-break-after: avoid; }
            .header { page-break-after: avoid; }
            table { page-break-inside: avoid; }
            tr { page-break-inside: avoid; }
          }
          ${config.customStyles || ""}
        </style>
      </head>
      <body style="font-size: 11px;">
        ${officialHeaderHtml}
        
        <div class="header">
          <h1>${config.title}</h1>
          ${config.subtitle ? `<h2>${config.subtitle}</h2>` : ""}
        </div>

        ${headerInfoHtml}

        <table class="export-template">
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="summary">
          Total: ${config.data.length} élément(s)
        </div>

        ${
          config.showDate !== false
            ? `
          <div class="footer">
            Généré le ${currentDate} à ${currentTime}
            ${config.showPageNumbers !== false ? " - Page 1" : ""}
          </div>
        `
            : ""
        }
      </body>
      </html>
    `;
  }

  /**
   * Génère le contenu CSV
   */
  private generateCSVContent(config: PrintConfig): string {
    // En-têtes CSV
    const headers = config.columns.map((col) => `"${col.label}"`).join(",");

    // Lignes de données CSV
    const rows = config.data
      .map((item) => {
        return config.columns
          .map((col) => {
            let value = this.getNestedValue(item, col.key);
            if (col.format && typeof col.format === "function") {
              value = col.format(value);
            }
            // Échapper les guillemets et encapsuler dans des guillemets
            return `"${String(value || "").replace(/"/g, '""')}"`;
          })
          .join(",");
      })
      .join("\n");

    return `${headers}\n${rows}`;
  }

  /**
   * Ouvre une nouvelle fenêtre pour l'impression
   */
  private openPrintWindow(content: string): void {
    const printWindow = window.open("", "_blank", "width=800,height=600");

    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();

      // Attendre que le contenu soit chargé avant d'imprimer
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    } else {
      console.error(
        "Impossible d'ouvrir la fenêtre d'impression. Vérifiez que les pop-ups ne sont pas bloqués."
      );
    }
  }

  /**
   * Génère un reçu de paiement pour un étudiant avec tous ses versements
   */
  async printPaymentReceipt(
    studentPayments: any[],
    studentInfo: any,
    schoolInfo: any,
    options: {
      print?: boolean;
      language?: "fr" | "en";
      expectedTotal?: number;
      orientation?: "portrait" | "landscape";
      allPaymentConfigs?: any[]; // Toutes les configurations de paiement disponibles
    } = {}
  ): Promise<void> {
    const {
      print = false,
      language = "fr",
      expectedTotal = 0,
      orientation = "landscape",
    } = options;
    const isEnglish = language === "en";

    if (!studentPayments || studentPayments.length === 0) {
      console.warn("Aucun paiement à imprimer");
      return;
    }

    // Calculer le total payé
    const totalPaid = studentPayments.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    );

    // Générer le contenu HTML personnalisé selon l'orientation
    const receiptContent =
      orientation === "landscape"
        ? await this.generateLandscapeReceiptContent(
            studentPayments,
            studentInfo,
            schoolInfo,
            totalPaid,
            isEnglish,
            options.allPaymentConfigs
          )
        : this.generateCustomReceiptContent(
            studentPayments,
            studentInfo,
            schoolInfo,
            totalPaid,
            isEnglish,
            options.allPaymentConfigs
          );

    const fileName = `recu-paiements-complet-${
      studentInfo?.matricule || "etudiant"
    }`;

    if (print) {
      // Créer une fenêtre d'impression
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (printWindow) {
        printWindow.document.write(receiptContent);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      }
    } else {
      // Générer le PDF
      await this.generateCustomReceiptPDF(
        receiptContent,
        fileName,
        orientation
      );
    }
  }

  /**
   * Génère le contenu HTML personnalisé pour le reçu en mode paysage (2 exemplaires)
   */
  private async generateLandscapeReceiptContent(
    studentPayments: any[],
    studentInfo: any,
    schoolInfo: any,
    totalPaid: number,
    isEnglish: boolean = false,
    allPaymentConfigs?: any[]
  ) {
    // Générer le contenu d'un seul reçu avec des tailles réduites
    const singleReceiptContent = await this.generateSingleReceiptContent(
      studentPayments,
      studentInfo,
      schoolInfo,
      totalPaid,
      isEnglish,
      allPaymentConfigs
    );

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>REÇU DE PAIEMENT - DOUBLE EXEMPLAIRE</title>
        <style>
          html, body {
            font-family: Arial, sans-serif;
            color: #000;
            line-height: 1.2;
            margin: 0;
            padding: 0px;
            font-size: 10px;
          }
          .landscape-container {
            display: flex;
            width: 100%;
            height: 100vh;
            gap: 50px;
          }
          .receipt-copy {
            width: 48%;
            padding: 8px;
            box-sizing: border-box;
          }
          .official-header {
            margin: 0 auto 10px auto;
          }
          .header-grid {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: start;
            padding: 5px 0;
          }
          .left-block, .right-block {
            width: fit-content;
            font-size: 8px;
            text-align: center;
            line-height: 1.1;
          }
          .left-block .country, .right-block .country {
            font-weight: bold;
            margin: 0 0 1px 0;
          }
          .left-block .motto, .right-block .motto {
            font-style: italic;
            margin: 0 0 6px 0;
          }
          .left-block .ministry, .right-block .ministry {
            font-weight: bold;
            margin: 0 0 6px 0;
          }
          .right-block {
            margin-left: auto;
          }
          .logo-center {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
          }
          .logo {
            width: 64px;
            height: 64px;
            object-fit: contain;
          }
          h1 {
            text-align: center;
            margin: 8px 0;
            font-size: 12px;
          }
          h2 {
            text-align: center;
            margin: 8px 0;
            font-size: 10px;
          }
          h3 {
            border-bottom: 0.5px solid #000;
            padding-bottom: 4px;
            margin-top: 8px;
            margin-bottom: 6px;
            font-size: 9px;
          }
          p {
            margin: 2px 0;
            font-size: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            font-size: 7px;
          }
          th, td {
            border: 0.5px solid #000;
            padding: 4px 6px;
            text-align: left;
          }
          th {
            background-color: #fff;
            font-weight: bold;
            font-size: 7px;
          }
          .total {
            margin-top: 8px;
            font-weight: bold;
            font-size: 8px;
          }
          .signature {
            text-align: right;
            margin-top: 20px;
            font-size: 7px;
          }
          .payment-summary {
            margin-top: 6px;
            border: 0.5px solid #000;
            padding: 4px;
            font-size: 6px;
          }
          .payment-summary h4 {
            margin: 0 0 6px 0;
            text-align: center;
            font-size: 8px;
            font-weight: bold;
          }
          .payment-summary table {
            font-size: 6px;
          }
          .payment-summary th, .payment-summary td {
            padding: 1px;
            font-size: 5px;
          }
          @media print {
            body { margin: 0; padding: 10px; }
            .landscape-container { height: auto; }
            .official-header { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="landscape-container">
          <!-- Premier exemplaire -->
          <div class="receipt-copy">
            ${singleReceiptContent}
          </div>
          
          <!-- Deuxième exemplaire -->
          <div class="receipt-copy">
            ${singleReceiptContent}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Génère le contenu d'un seul reçu (utilisé pour les deux exemplaires en mode paysage)
   */
  private async generateSingleReceiptContent(
    studentPayments: any[],
    studentInfo: any,
    schoolInfo: any,
    totalPaid: number,
    isEnglish: boolean = false,
    allPaymentConfigs?: any[]
  ): Promise<string> {
    console.log(`${environment.apiUrl}${schoolInfo.logoMedia.url}`);
    const logoUrl = await this.convertImagePathToBase64(
      `${environment.apiUrl}${schoolInfo.logoMedia.url}`
    ); // ?? "/school-logo.jpg";

    console.log("LODO: ", logoUrl, schoolInfo);

    const currentDate = this.formatDateForReceipt(new Date());

    // Générer l'en-tête officiel
    const officialHeaderHtml = `
      <section class="official-header">
        <div class="header-grid">
          <!-- Bloc gauche (FR) -->
          <div class="left-block">
            <p class="country">RÉPUBLIQUE DU CAMEROUN</p>
            <p class="motto">Paix - Travail - Patrie</p>
            <p class="ministry">MINISTÈRE DE L'ENSEIGNEMENT SECONDAIRE</p>
            <p>${schoolInfo?.address} TEL. ${
      schoolInfo?.phoneNumber.internationalNumber
    }</p>
          </div>

          <!-- Logo au centre -->
          <div class="logo-center">
            <img src="${logoUrl}" alt="Logo" class="logo" />
          </div>
          

          <!-- Bloc droit (EN) -->
          <div class="right-block">
            <p class="country">REPUBLIC OF CAMEROON</p>
            <p class="motto">Peace - Work - Fatherland</p>
            <p class="ministry">MINISTRY OF SECONDARY EDUCATION</p>
            <p>${schoolInfo?.address} TEL. ${
      schoolInfo?.phoneNumber.internationalNumber
    }</p>

          </div>
        </div>

        <div>
          <h1>${schoolInfo?.name || "ÉTABLISSEMENT"}</h1>
        </div>
      </section>
    `;

    // Générer les lignes du tableau des paiements
    const paymentRows = studentPayments
      .map(
        (payment) => `
      <tr>
        <td>${payment.paymentConfig?.name || "Frais de scolarité"}</td>
        <td>${payment.code || "N/A"}</td>
        <td>${this.formatCurrencyForReceipt(payment.amount || 0)}</td>
        <td>${this.formatDateTimeForReceipt(payment.paidAt)}</td>
      </tr>
    `
      )
      .join("");

    return `
      ${officialHeaderHtml}
      
      <h2>REÇU DE PAIEMENT</h2>
      <p style="text-align: center; font-weight: bold;">ANNÉE SCOLAIRE : ${this.getCurrentAcademicYear()}</p>

      <div style="display: flex; justify-content: space-between; margin-top: 8px;">
        <!-- Section IDENTITÉ à gauche -->
        <div style="width: 48%; padding-right: 2%;">
          <!-- <h3>IDENTITÉ</h3> -->
          <p><b>Matricule :</b> ${studentInfo?.matricule || "N/A"}</p>
          <p><b>Nom :</b> ${
            studentInfo?.account?.lastName?.toUpperCase() || "N/A"
          }</p>
          <p><b>Prénoms :</b> ${
            studentInfo?.account?.firstName?.toUpperCase() || "N/A"
          }</p>
          <p><b>Date et lieu de naissance :</b> ${this.formatDateForReceipt(
            studentInfo?.account.birthDate
          )} à ${studentInfo?.birthPlace?.toUpperCase() || "N/A"}</p>
          <p><b>Nationalité :</b> ${
            studentInfo?.nationality?.toUpperCase() || "N/A"
          }</p>
        </div>

        <!-- Section INSCRIPTION à droite -->
        <div style="width: 48%; padding-left: 2%;">
         <!-- <h3>INSCRIPTION</h3> -->
          <p><b>Classe :</b> ${
            studentInfo?.enrollments?.[0]?.class?.name?.toUpperCase() || "N/A"
          }</p>
          <p><b>Niveau :</b> ${
            studentInfo?.enrollments?.[0]?.class?.academicLevel?.name || "N/A"
          } | <b>Spécialité :</b> ${
      studentInfo?.enrollments?.[0]?.class?.specialty?.name || "N/A"
    }</p>
          <p><b>Cycle :</b> ${
            studentInfo?.enrollments?.[0]?.class?.academicLevel?.academicCycle
              ?.name || "N/A"
          }</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Type de paiement</th>
            <th>Code de paiement</th>
            <th>Montant</th>
            <th>Date et Heure</th>
          </tr>
        </thead>
        <tbody>
          ${paymentRows}
        </tbody>
      </table>

      <p class="total">TOTAL PAYÉ : ${this.formatCurrencyForReceipt(
        totalPaid
      )}</p>

      ${this.generatePaymentSummary(
        studentPayments,
        totalPaid,
        isEnglish,
        allPaymentConfigs
      )}

      <div style="text-align: right; margin-top: 15px;">
        <p>Fait à Yaoundé, le ${currentDate}</p>
        <p style="margin-top: 20px;">L'économe</p>
      </div>
    `;
  }

  /**
   * Génère le contenu HTML personnalisé pour le reçu
   */
  private generateCustomReceiptContent(
    studentPayments: any[],
    studentInfo: any,
    schoolInfo: any,
    totalPaid: number,
    isEnglish: boolean = false,
    allPaymentConfigs?: any[]
  ): string {
    const logoUrl = `${environment.apiUrl}${schoolInfo.logoMedia.url}`; // ?? "/school-logo.jpg";
    console.log("url: ", logoUrl);

    const currentDate = this.formatDateForReceipt(new Date());

    // Générer l'en-tête officiel
    const officialHeaderHtml = `
      <section class="official-header">
        <div class="header-grid">
          <!-- Bloc gauche (FR) -->
          <div class="left-block">
            <p class="country">RÉPUBLIQUE DU CAMEROUN</p>
            <p class="motto">Paix - Travail - Patrie</p>
            <p class="ministry">MINISTÈRE DE L'ENSEIGNEMENT SECONDAIRE</p>
            <p>${schoolInfo?.address} TEL. ${
      schoolInfo?.phoneNumber.internationalNumber
    }</p>


          </div>

          <!-- Logo au centre 
          <div class="logo-center">
            <img src="${logoUrl}" alt="Logo" class="logo" />
          </div>
          -->

          <!-- Bloc droit (EN) -->
          <div class="right-block">
            <p class="country">REPUBLIC OF CAMEROON</p>
            <p class="motto">Peace - Work - Fatherland</p>
            <p class="ministry">MINISTRY OF SECONDARY EDUCATION</p>
            <p>${schoolInfo?.address} TEL. ${
      schoolInfo?.phoneNumber.internationalNumber
    }</p>

          </div>
        </div>

        <div>
          <h1 style="text-align: center; width: 100%">${
            schoolInfo?.name || "ÉTABLISSEMENT"
          }</h1>
        </div>
      </section>
    `;

    // Générer les lignes du tableau des paiements
    const paymentRows = studentPayments
      .map(
        (payment) => `
      <tr>
        <td style="border: 0.5px solid #000; font-size: 22px; padding: 6px 8px;">${
          payment.paymentConfig?.name || "Frais de scolarité"
        }</td>
        <td style="border: 0.5px solid #000; padding: 6px 8px;">${
          payment.reference || "N/A"
        }</td>
        <td style="border: 0.5px solid #000; padding: 6px 8px;">${this.formatCurrencyForReceipt(
          payment.amount || 0
        )}</td>
        <td style="border: 0.5px solid #000; padding: 6px 8px;">${this.formatDateTimeForReceipt(
          payment.paidAt
        )}</td>
      </tr>
    `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>REÇU DE PAIEMENT</title>
        <style>
          html, body {
            font-family: Arial, sans-serif;
            color: #000;
            line-height: 1.4;
            margin: 0;
            padding: 5px;
          }
          .official-header {
            margin: 0 auto 20px auto;
          }
          .header-grid {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: start;
            padding: 10px 0;
          }
          .left-block, .right-block {
            width: fit-content;
            font-size: 14px;
            text-align: center;
            line-height: 1.3;
          }
          .left-block .country, .right-block .country {
            font-weight: bold;
            margin: 0 0 2px 0;
          }
          .left-block .motto, .right-block .motto {
            font-style: italic;
            margin: 0 0 12px 0;
          }
          .left-block .ministry, .right-block .ministry {
            font-weight: bold;
            margin: 0 0 12px 0;
          }
          .right-block {
            margin-left: auto;
          }
          .logo-center {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
          }
          .logo {
            width: 64px;
            height: 64px;
            object-fit: contain;
          }
          h1 {
            text-align: center;
            margin: 20px 0;
          }
          h2 {
            text-align: center;
            margin: 20px 0;
          }
          h3 {
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
            margin-top: 20px;
          }
          p {
            margin: 5px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th, td {
            border: 0.5px solid #000;
            padding: 6px 8px;
            text-align: left;
          }
          th {
            background-color: #fff;
            font-weight: bold;
          }
          .total {
            margin-top: 15px;
            font-weight: bold;
          }
          .signature {
            text-align: right;
            margin-top: 50px;
          }
          @media print {
            body { margin: 0; padding: 20px; }
            .official-header { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        ${officialHeaderHtml}
        
        <h2 style="text-align: center; margin: 5px 0;">REÇU DE PAIEMENT</h2>
        <p style="text-align: center; font-weight: bold;">ANNÉE ACADEMIQUE : ${this.getCurrentAcademicYear()}</p>

        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
          <!-- Section IDENTITÉ à gauche -->
          <div style="width: 48%; padding-right: 2%;">
            <h3 style="border-bottom: 0.5px solid #000; padding-bottom: 8px; margin-top: 0; margin-bottom: 10px;">IDENTITÉ</h3>
            <p><b>Matricule MESRS :</b> ${studentInfo?.matricule || "N/A"}</p>
            <p><b>Nom :</b> ${
              studentInfo?.account?.lastName?.toUpperCase() || "N/A"
            }</p>
            <p><b>Prénoms :</b> ${
              studentInfo?.account?.firstName?.toUpperCase() || "N/A"
            }</p>
            <p><b>Date et lieu de naissance :</b> ${this.formatDateForReceipt(
              studentInfo?.account?.birthDate
            )} à ${studentInfo?.birthPlace?.toUpperCase() || "N/A"}</p>
            <p><b>Nationalité :</b> ${
              studentInfo?.nationality?.toUpperCase() || "N/A"
            }</p>
          </div>

          <!-- Section INSCRIPTION à droite -->
          <div style="width: 48%; padding-left: 2%;">
            <h3 style="border-bottom: 0.5px solid #000; padding-bottom: 8px; margin-top: 0; margin-bottom: 10px;">INSCRIPTION</h3>
            <p><b>Filière :</b> ${
              studentInfo?.enrollments?.[0]?.class?.name?.toUpperCase() || "N/A"
            }</p>
            <p><b>Niveau :</b> ${
              studentInfo?.enrollments?.[0]?.class?.academicLevel?.name || "N/A"
            } | <b>Spécialité :</b> ${
      studentInfo?.enrollments?.[0]?.class?.specialty?.name || ""
    }</p>
            <p><b>Cycle :</b> ${
              studentInfo?.enrollments?.[0]?.class?.academicLevel?.academicCycle
                ?.name || "N/A"
            }</p>
            <p><b>Type formation :</b> FORMATION INITIALE</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr>
              <th style="border: 0.5px solid #000; padding:  8px;">Type de paiement</th>
              <th style="border: 0.5px solid #000; padding: 6px 8px;">Code de paiement</th>
              <th style="border: 0.5px solid #000; padding: 6px 8px;">Montant</th>
              <th style="border: 0.5px solid #000; padding: 6px 8px;">Date et Heure</th>
            </tr>
          </thead>
          <tbody>
            ${paymentRows}
          </tbody>
        </table>

        <p style="margin-top: 15px; font-weight: bold;">TOTAL PAYÉ : ${this.formatCurrencyForReceipt(
          totalPaid
        )}</p>

        ${this.generatePaymentSummary(
          studentPayments,
          totalPaid,
          isEnglish,
          allPaymentConfigs
        )}

        <div style="text-align: right; margin-top: 40px;">
          <p>Fait à Yaoundé, le ${currentDate}</p>
          <p style="margin-top: 50px;">L'économe</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Génère le PDF personnalisé pour le reçu
   */
  private async generateCustomReceiptPDF(
    content: string,
    filename: string,
    orientation: "portrait" | "landscape" = "portrait"
  ): Promise<void> {
    try {
      // Créer un iframe isolé pour éviter les conflits de style
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.left = "-9999px";
      iframe.style.top = "-9999px";
      iframe.style.width = orientation === "landscape" ? "297mm" : "210mm";
      iframe.style.height = orientation === "landscape" ? "210mm" : "297mm";
      iframe.style.border = "none";
      iframe.style.backgroundColor = "white";

      document.body.appendChild(iframe);

      // Attendre que l'iframe soit prêt
      await new Promise((resolve) => {
        iframe.onload = resolve;
        iframe.src = "about:blank";
      });

      // Écrire le contenu dans l'iframe
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error("Impossible d'accéder au document de l'iframe");
      }

      iframeDoc.open();
      iframeDoc.write(content);
      iframeDoc.close();

      // Attendre un peu pour que le contenu soit rendu
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Définir les dimensions du canvas selon l'orientation
      const canvasWidth = orientation === "landscape" ? 1123 : 794; // A4 dimensions in pixels at 96 DPI
      const canvasHeight = orientation === "landscape" ? 794 : 1123;

      // Convertir le contenu de l'iframe en canvas
      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: canvasWidth,
        height: canvasHeight,
      });

      // Supprimer l'iframe
      document.body.removeChild(iframe);

      // Créer le PDF avec l'orientation appropriée
      const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");

      // Définir les marges (en mm)
      const marginTop = 8;
      const marginBottom = 8;
      const marginLeft = 8;
      const marginRight = 8;

      // Dimensions selon l'orientation
      const pageWidth = orientation === "landscape" ? 297 : 210; // A4 dimensions in mm
      const pageHeight = orientation === "landscape" ? 210 : 297;
      const usableWidth = pageWidth - marginLeft - marginRight;
      const usableHeight = pageHeight - marginTop - marginBottom;

      // Calculer les dimensions de l'image en tenant compte des marges
      const imgWidth = usableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = marginTop;

      // Ajouter la première page
      pdf.addImage(imgData, "PNG", marginLeft, position, imgWidth, imgHeight);
      heightLeft -= usableHeight;

      // Ajouter des pages supplémentaires si nécessaire
      while (heightLeft >= 0) {
        position = marginTop - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, "PNG", marginLeft, position, imgWidth, imgHeight);
        heightLeft -= usableHeight;
      }

      // Télécharger le PDF
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      // Fallback vers la méthode d'impression classique
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (printWindow) {
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  }

  /**
   * Génère le résumé des paiements avec le reste à payer
   */
  private generatePaymentSummary(
    studentPayments: any[],
    totalPaid: number,
    isEnglish: boolean = false,
    allPaymentConfigs?: any[]
  ): string {
    // Calculer le montant total attendu basé sur les configurations de paiement
    const expectedAmounts = this.calculateExpectedAmounts(
      studentPayments,
      allPaymentConfigs
    );
    const totalExpected = expectedAmounts.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const remainingAmount = Math.max(0, totalExpected - totalPaid);

    // Générer la liste des éléments attendus
    const expectedItemsHtml = expectedAmounts
      .map(
        (item) => `
      <tr>
        <td style="border: 0.5px solid #000; padding: 6px 8px; font-size: 11px;">${
          item.name
        }</td>
        <td style="border: 0.5px solid #000; padding: 6px 8px; text-align: right; font-size: 11px;">${this.formatCurrencyForReceipt(
          item.amount
        )}</td>
        <td style="border: 0.5px solid #000; padding: 6px 8px; text-align: right; font-size: 11px;">${this.formatCurrencyForReceipt(
          item.paid
        )}</td>
        <td style="border: 0.5px solid #000; padding: 6px 8px; text-align: right; font-size: 11px; font-weight: bold;">${this.formatCurrencyForReceipt(
          item.remaining
        )}</td>
      </tr>
    `
      )
      .join("");

    const statusText =
      remainingAmount > 0
        ? isEnglish
          ? "PARTIAL PAYMENT"
          : "PAIEMENT PARTIEL"
        : isEnglish
        ? "FULLY PAID"
        : "ENTIÈREMENT PAYÉ";

    const statusColor = remainingAmount > 0 ? "#fff3cd" : "#d1edff";
    const statusBorderColor = remainingAmount > 0 ? "#ffc107" : "#0dcaf0";

    return `
        <div style="margin-top: 7px; border: 0.5px solid #000; padding: 5px;">
        <h4 style="margin: 0 0 10px 0; text-align: center; font-size: 8px; font-weight: bold;">
          ${isEnglish ? "PAYMENT BREAKDOWN" : "DÉTAIL DES PAIEMENTS"}
        </h4>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
          <thead>
            <tr style="background-color: #fff;">
              <th style="border: 0.5px solid #000; padding: 6px 8px; font-size: 8px; font-weight: bold;">
                ${isEnglish ? "Payment Type" : "Type de Paiement"}
              </th>
              <th style="border: 0.5px solid #000; padding: 6px 8px; font-size: 8px; font-weight: bold; text-align: right;">
                ${isEnglish ? "Expected" : "Attendu"}
              </th>
              <th style="border: 0.5px solid #000; padding: 6px 8px; font-size: 8px; font-weight: bold; text-align: right;">
                ${isEnglish ? "Paid" : "Payé"}
              </th>
              <th style="border: 0.5px solid #000; padding: 6px 8px; font-size: 8px; font-weight: bold; text-align: right;">
                ${isEnglish ? "Remaining" : "Reste"}
              </th>
            </tr>
          </thead>
          <tbody>
            ${expectedItemsHtml}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <div style="font-weight: bold;">
            ${
              isEnglish ? "TOTAL EXPECTED:" : "TOTAL ATTENDU :"
            } ${this.formatCurrencyForReceipt(totalExpected)}
          </div>
          <div style="font-weight: bold;">
            ${
              isEnglish ? "TOTAL PAID:" : "TOTAL PAYÉ :"
            } ${this.formatCurrencyForReceipt(totalPaid)}
          </div>
        </div>

        <div style="text-align: center; padding: 4px; background-color: #fff; border: 1px solid #000; font-weight: bold; font-size: 8px;">
          ${isEnglish ? "STATUS:" : "STATUT :"} ${statusText}
          ${
            remainingAmount > 0
              ? `<br><span style="color: #000;">${
                  isEnglish ? "REMAINING:" : "RESTE À PAYER :"
                } ${this.formatCurrencyForReceipt(remainingAmount)}</span>`
              : ""
          }
        </div>
      </div>
    `;
  }

  /**
   * Calcule les montants attendus basés sur toutes les configurations de paiement disponibles
   */
  private calculateExpectedAmounts(
    studentPayments: any[],
    allPaymentConfigs?: any[]
  ): Array<{ name: string; amount: number; paid: number; remaining: number }> {
    // Récupérer toutes les configurations de paiement uniques
    const allConfigs = new Map<string, any>();

    // D'abord, ajouter toutes les configurations fournies en paramètre
    if (allPaymentConfigs && allPaymentConfigs.length > 0) {
      allPaymentConfigs
        .sort((a, b) => a.order - b.order)
        .forEach((config) => {
          const configId = config.id || config.code;
          if (configId && !allConfigs.has(configId)) {
            allConfigs.set(configId, config);
          }
        });
    }

    // Ensuite, collecter toutes les configurations depuis les paiements existants (au cas où certaines ne seraient pas dans allPaymentConfigs)
    studentPayments.forEach((payment) => {
      if (payment.paymentConfig) {
        const configId = payment.paymentConfig.id || payment.paymentConfig.code;
        if (configId && !allConfigs.has(configId)) {
          allConfigs.set(configId, payment.paymentConfig);
        }
      }
    });

    // Grouper les paiements par configuration
    const paymentsByConfig = new Map<string, any[]>();

    studentPayments.forEach((payment) => {
      const configId =
        payment.paymentConfig?.id || payment.paymentConfig?.code || "default";
      const configName = payment.paymentConfig?.name || "Frais de scolarité";

      if (!paymentsByConfig.has(configId)) {
        paymentsByConfig.set(configId, []);
      }
      paymentsByConfig.get(configId)!.push(payment);
    });

    // Calculer les montants pour chaque configuration
    const expectedAmounts: Array<{
      name: string;
      amount: number;
      paid: number;
      remaining: number;
    }> = [];

    // Traiter toutes les configurations trouvées (y compris celles sans paiements)
    allConfigs.forEach((config, configId) => {
      const paymentsForConfig = paymentsByConfig.get(configId) || [];
      const totalPaidForConfig = paymentsForConfig.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      );

      // Utiliser le montant de la configuration comme montant attendu
      const expectedAmount = config.amount || 0;
      const remaining = Math.max(0, expectedAmount - totalPaidForConfig);

      expectedAmounts.push({
        name: config.name || "Configuration de paiement",
        amount: expectedAmount,
        paid: totalPaidForConfig, // Sera 0 si aucun paiement n'a été effectué
        remaining: remaining,
      });
    });

    // Traiter les paiements sans configuration spécifique seulement s'il n'y a pas de configurations fournies
    if (!allPaymentConfigs || allPaymentConfigs.length === 0) {
      const paymentsWithoutConfig = paymentsByConfig.get("default") || [];
      if (paymentsWithoutConfig.length > 0) {
        const totalPaidWithoutConfig = paymentsWithoutConfig.reduce(
          (sum, payment) => sum + (payment.amount || 0),
          0
        );

        expectedAmounts.push({
          name: "Frais de scolarité",
          amount: totalPaidWithoutConfig, // Pour les paiements sans config, on considère que le montant payé est le montant attendu
          paid: totalPaidWithoutConfig,
          remaining: 0,
        });
      }
    }

    // Si aucune configuration n'est trouvée et qu'il n'y a pas de configurations fournies, créer une entrée générique
    if (
      expectedAmounts.length === 0 &&
      studentPayments.length > 0 &&
      (!allPaymentConfigs || allPaymentConfigs.length === 0)
    ) {
      const totalPaid = studentPayments.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      );
      expectedAmounts.push({
        name: "Frais de scolarité",
        amount: totalPaid,
        paid: totalPaid,
        remaining: 0,
      });
    }

    return expectedAmounts;
  }

  /**
   * Récupère la date du dernier paiement pour un type donné avec date et heure
   */
  private getLatestPaymentDateForType(
    studentPayments: any[],
    paymentType: string
  ): string {
    const paymentsForType = studentPayments.filter(
      (payment) =>
        (payment.paymentConfig?.name || "Frais de scolarité") === paymentType
    );

    if (paymentsForType.length === 0) {
      return "N/A";
    }

    // Trouver le paiement le plus récent
    const latestPayment = paymentsForType.reduce((latest, current) => {
      const latestDate = new Date(latest.paidAt || 0);
      const currentDate = new Date(current.paidAt || 0);
      return currentDate > latestDate ? current : latest;
    });

    return this.formatDateTimeForReceipt(latestPayment.paidAt);
  }

  /**
   * Formate une date avec l'heure pour le reçu
   */
  private formatDateTimeForReceipt(date: string | Date | null): string {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Méthodes utilitaires pour les reçus de paiement
   */
  private getCurrentAcademicYear(): string {
    const currentYear = new Date().getFullYear();
    return `${currentYear} - ${currentYear + 1}`;
  }

  private getCurrentSession(isEnglish: boolean = false): string {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    if (month >= 9) {
      return isEnglish
        ? `September ${year} - ${year + 1} Session`
        : `Rentrée de septembre ${year} - ${year + 1}`;
    } else {
      return isEnglish
        ? `January ${year} Session`
        : `Session de janvier ${year}`;
    }
  }

  private formatDateForReceipt(date: string | Date | null): string {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  private formatCurrencyForReceipt(amount: number): string {
    return (
      new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + " F"
    );
  }

  private getPaymentMethodLabel(
    method: string,
    isEnglish: boolean = false
  ): string {
    const methods: { [key: string]: { fr: string; en: string } } = {
      CASH: { fr: "Espèces", en: "Cash" },
      BANK_TRANSFER: { fr: "Virement bancaire", en: "Bank Transfer" },
      MOBILE_MONEY: { fr: "Mobile Money", en: "Mobile Money" },
      CARD: { fr: "Carte bancaire", en: "Card Payment" },
    };
    return methods[method] ? methods[method][isEnglish ? "en" : "fr"] : method;
  }

  private getPaymentStatusLabel(
    status: string,
    isEnglish: boolean = false
  ): string {
    const statuses: { [key: string]: { fr: string; en: string } } = {
      PENDING: { fr: "En attente", en: "Pending" },
      COMPLETED: { fr: "Terminé", en: "Completed" },
      FAILED: { fr: "Échoué", en: "Failed" },
      CANCELLED: { fr: "Annulé", en: "Cancelled" },
    };
    return statuses[status]
      ? statuses[status][isEnglish ? "en" : "fr"]
      : status;
  }

  /**
   * Récupère une valeur imbriquée d'un objet en utilisant une notation pointée
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }
}
