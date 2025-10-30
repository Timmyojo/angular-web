import { Component, Input } from "@angular/core";

@Component({
  selector: "app-generic-error",
  standalone: true,
  template: `
    <div class="bg-red-100 my-2 p-4 w-full text-red-400 italic text-center">
      {{ message || "An error occurred while loading request" }}
    </div>
  `,
})
export class GenericErrorComponent {
  @Input() message?: string;
}
