import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-message-dialog",
  standalone: true,
  template: `
    <div class="w-full max-w-md p-6">
      <h2 class="text-xl font-semibold mb-4">
        {{ data.title || "Success" }}
      </h2>

      <p class="mb-6 text-gray-700">
        {{ data.message }}
      </p>

      <div class="text-right">
        <button class="app-primary" (click)="onClose()">OK</button>
      </div>
    </div>
  `,
})
export class MessageDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title?: string;
      message: string;
      handleOk?: () => void;
    }
  ) {}

  onClose(): void {
    this.dialogRef.close();
    this.data.handleOk?.();
  }
}
