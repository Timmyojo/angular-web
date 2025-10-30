import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { GenericAutoCompleteComponent } from "../generic-autocomplete/generic-autocomplete.component";
import { GenericTextEditorComponent } from "../generic-text-editor/generic-text-editor.component";
import { TranslocoModule } from "@ngneat/transloco";
import {
  CountryISO,
  NgxIntlTelInputModule,
  SearchCountryField,
} from "ngx-intl-tel-input";

// === INTERFACES ===

interface FieldSize {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export interface FieldConfig {
  name: string;
  label: string;
  type?: FieldType;
  options?: any[];
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  multiple?: boolean;
  acceptedFileExtensions?: string[];
  fieldset?: string;
  disabled?: boolean;
  defaultValue?: any;
  dynamicConfig?: (
    formValues: any
  ) => Partial<Omit<FieldConfig, "dynamicConfig">>;
  validation?: any[];
  errorMessages?: { [key: string]: string };
  order?: number;
  size?: FieldSize;
  displayFn?: (item: any) => string;
  editorOptions?: {
    minHeight?: number;
    readOnly?: boolean;
    toolbarSticky?: boolean;
  };
}

export interface FieldGroup {
  fieldset: string;
  fields: FieldConfig[];
  size?: FieldSize;
}

type FieldType =
  | "string"
  | "password"
  | "number"
  | "select"
  | "autocomplete"
  | "date"
  | "datetime"
  | "file"
  | "email"
  | "textarea"
  | "url"
  | "checkbox"
  | "phone"
  | "richtext";

// === COMPONENT ===

@Component({
  selector: "app-generic-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    GenericAutoCompleteComponent,
    GenericTextEditorComponent,
    NgxIntlTelInputModule,
  ],
  templateUrl: "./generic-form.component.html",
  styleUrls: ["./generic-form.component.scss"],
})
export class GenericFormComponent implements OnInit, OnChanges {
  // ⚡️ Accepte FieldGroup[] OU FieldConfig[]
  @Input() fieldConfigurations: (FieldGroup | FieldConfig)[] = [];
  @Input() defaultValues: any = {};
  @Input() errorMessage?: string;
  @Input() transationNamespace?: string;
  @Input() isLoading = false;
  @Input() showActionButton = true;
  @Output() submitForm = new EventEmitter<any>();

  CountryISO = CountryISO;
  SearchCountryField = SearchCountryField;

  form!: FormGroup;
  fieldsets: FieldGroup[] = [];
  submitted = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes["fieldConfigurations"] &&
      !changes["fieldConfigurations"].firstChange
    ) {
      this.initializeForm();
      return;
    }

    if (changes["defaultValues"] && !changes["defaultValues"].firstChange) {
      this.patchDefaultValues();
    }

    if (this.form && this.fieldConfigurations) {
      this.updateFieldOptions();
    }
  }

  private addControlToGroup(
    field: FieldConfig,
    group: Record<string, FormControl>
  ) {
    const dynamicConfig = field.dynamicConfig
      ? field.dynamicConfig(this.defaultValues)
      : {};
    const mergedField = { ...field, ...dynamicConfig };

    const validators = mergedField.validation || [];
    if (mergedField.required) {
      validators.push(Validators.required);
    }

    const defaultValue =
      this.defaultValues?.[mergedField.name] ?? mergedField.defaultValue ?? "";

    group[mergedField.name] = new FormControl(
      { value: defaultValue, disabled: mergedField.disabled },
      validators
    );
  }

  initializeForm() {
    const group: Record<string, FormControl> = {};
    this.fieldsets = [];

    const firstItem = this.fieldConfigurations[0] as FieldGroup;

    if (firstItem && "fields" in firstItem) {
      // === Mode groupé ===
      this.fieldsets = this.fieldConfigurations as FieldGroup[];
      this.fieldsets.forEach((groupConfig) => {
        groupConfig.fields.forEach((field) => {
          this.addControlToGroup(field, group);
        });
      });
    } else {
      // === Mode plat ===
      const fields = this.fieldConfigurations as FieldConfig[];
      const defaultGroup: FieldGroup = { fieldset: "Default", fields };
      this.fieldsets = [defaultGroup];

      fields.forEach((field) => {
        this.addControlToGroup(field, group);
      });
    }

    this.form = this.fb.group(group);
    this.patchDefaultValues();
  }

  patchDefaultValues(): void {
    if (!this.form || !this.defaultValues) return;

    Object.entries(this.defaultValues).forEach(([key, value]) => {
      const control = this.form.get(key);
      if (control) {
        control.patchValue(value);
      }
    });
  }

  updateFieldOptions(): void {
    if (!this.form || !this.fieldConfigurations) return;

    const firstItem = this.fieldConfigurations[0] as FieldGroup;

    if (firstItem && "fields" in firstItem) {
      // === Mode groupé ===
      this.fieldsets = (this.fieldConfigurations as FieldGroup[]).map(
        (groupConfig) => {
          const fields = groupConfig.fields.map((field) => {
            const dynamicConfig = field.dynamicConfig
              ? field.dynamicConfig(this.form.value)
              : {};
            return { ...field, ...dynamicConfig };
          });
          return { ...groupConfig, fields };
        }
      );
    } else {
      // === Mode plat ===
      const fields = (this.fieldConfigurations as FieldConfig[]).map(
        (field) => {
          const dynamicConfig = field.dynamicConfig
            ? field.dynamicConfig(this.form.value)
            : {};
          return { ...field, ...dynamicConfig };
        }
      );
      this.fieldsets = [{ fieldset: "Default", fields }];
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(
      control &&
      control.invalid &&
      (control.touched || this.submitted)
    );
  }

  onSubmit(): void {
    this.submitted = true;
    this.form.markAllAsTouched();

    if (this.form.valid) {
      this.submitForm.emit(this.form.value);
    }
  }

  submit(): void {
    this.onSubmit();
  }

  getFieldSizeClasses(size: FieldSize = {}): string {
    const xs = size.xs ?? 12;
    const sm = size.sm ?? xs;
    const md = size.md ?? sm;
    const lg = size.lg ?? md;
    const xl = size.xl ?? lg;

    return `col-${xs} col-sm-${sm} col-md-${md} col-lg-${lg} col-xl-${xl}`;
  }

  onFileChange(event: any, field: FieldConfig) {
    const files = event.target.files;
    const control = this.form.get(field.name);
    if (!control) return;

    if (files && field.multiple) {
      control.setValue(Array.from(files));
    } else if (files && files[0]) {
      control.setValue(files[0]);
    }
  }

  getFirstErrorMessage(field: FieldConfig): string {
    const errors = this.form.get(field.name)?.errors;
    if (!errors) return "";

    const firstKey = Object.keys(errors)[0];
    return field.errorMessages?.[firstKey] || "Valeur invalide";
  }

  getFormControl(fieldName: string): FormControl {
    return this.form.get(fieldName) as FormControl;
  }

  defaultDisplayFn = (item: any): string => {
    if (!item) return "";
    if (typeof item === "string") return item;
    if (typeof item === "object") {
      return item.label ?? item.name ?? JSON.stringify(item);
    }
    return String(item);
  };

  getFieldsetGridClass(fieldset: FieldGroup): string {
    const size = fieldset.size ?? { xs: 12 };
    const xs = size.xs ?? 12;
    const sm = size.sm ?? xs;
    const md = size.md ?? sm;
    const lg = size.lg ?? md;
    const xl = size.xl ?? lg;

    return `grid grid-cols-${xs} sm:grid-cols-${sm} md:grid-cols-${md} lg:grid-cols-${lg} xl:grid-cols-${xl} gap-4`;
  }
}
