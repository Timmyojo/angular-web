import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Inject,
  Output,
  TemplateRef,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";

export type GenericModalColor = "primary" | "accent" | "warn";
export type GenericModalActionValue = "cancel" | "confirm" | "ok";
export type GenericModalType = "info" | "danger" | "warn" | "success";

export interface GenericModalData {
  title?: string;
  type?: GenericModalType;
  content?: string;
  html?: string;
  template?: TemplateRef<any>;
  actions?: {
    id?: GenericModalActionValue;
    label: string;
    value?: any;
    color?: GenericModalColor;
    isLoading?: boolean;
  }[];
}

@Component({
  selector: "app-generic-modal",
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: "./generic-modal.component.html",
  styleUrl: "./generic-modal.component.scss",
})
export class GenericModalComponent {
  @Output() action = new EventEmitter<GenericModalActionValue>();

  constructor(
    public dialogRef: MatDialogRef<GenericModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GenericModalData,
  ) {}

  get isLoading() {
    return this.data.actions?.some((a) => a.isLoading);
  }

  get isErrorType() {
    return this.data.type === "danger";
  }

  close(value: GenericModalActionValue | undefined): void {
    this.action.emit(value);
  }

  getButtonClass(color: string | undefined): string {
    switch (color) {
      case "primary":
        return "app-primary";
      case "accent":
        return "bg-purple-500 hover:bg-purple-700 text-white";
      case "warn":
        return "bg-red-500 hover:bg-red-700 text-white";
      default:
        return "bg-gray-200 hover:bg-gray-300 text-gray-800";
    }
  }
}
