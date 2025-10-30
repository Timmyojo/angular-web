import { Component, Input } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { TranslocoService } from "@ngneat/transloco";

@Component({
  selector: "app-form-field-errors",
  templateUrl: "./form-field-errors.component.html",
})
export class FormFieldErrorsComponent {
  @Input() control!: AbstractControl | null;
  @Input() fieldName!: string;

  constructor(private transloco: TranslocoService) {}

  get errorMessages(): string[] {
    if (!this.control || !this.control.errors || !this.control.touched) {
      return [];
    }

    return Object.keys(this.control.errors).map((key) =>
      this.getErrorMessage(key, this.control?.errors?.[key])
    );
  }

  private getErrorMessage(key: string, errorData: any): string {
    const specificKey = `formErrors.fields.${this.fieldName}.${key}`;
    const genericKey = `formErrors.${key}`;
    const params = { length: errorData?.requiredLength };

    // Vérifie si la traduction spécifique existe, sinon fallback
    if (this.transloco.translate(specificKey, params) !== specificKey) {
      return this.transloco.translate(specificKey, params);
    }

    return this.transloco.translate(genericKey, params);
  }
}
