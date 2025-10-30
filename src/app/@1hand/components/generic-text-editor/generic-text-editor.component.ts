import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from "@angular/forms";
import { TranslocoModule } from "@ngneat/transloco";
import Quill from "quill";

@Component({
  selector: "app-generic-text-editor",
  templateUrl: "./generic-text-editor.component.html",
  styleUrls: ["./generic-text-editor.component.scss"],
  imports: [CommonModule, ReactiveFormsModule, TranslocoModule],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GenericTextEditorComponent),
      multi: true,
    },
  ],
})
export class GenericTextEditorComponent
  implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor
{
  @ViewChild("toolbar", { static: true })
  toolbarRef!: ElementRef<HTMLDivElement>;
  @ViewChild("editor", { static: true }) editorRef!: ElementRef<HTMLDivElement>;

  /** Placeholer affiché dans l’éditeur */
  @Input() placeholder = "Message...";
  /** Lecture seule */
  @Input() readOnly = false;
  /** Valeur initiale HTML (si utilisée sans Forms API) */
  @Input() value: string | null = null;

  /** Événement quand le HTML change (en plus du ControlValueAccessor) */
  @Output() valueChange = new EventEmitter<string>();

  quill!: Quill;
  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};
  private isDisabled = false;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Configuration Quill complète (ta config)
    const modules = {
      toolbar: {
        container: this.toolbarRef.nativeElement,
      },
      // Ajoute d'autres modules ici si besoin (clipboard, history, mention, etc.)
    };

    this.quill = new Quill(this.editorRef.nativeElement, {
      modules,
      placeholder: this.placeholder,
      theme: "snow",
      bounds: this.editorRef.nativeElement,
      readOnly: this.readOnly,
      // scrollingContainer: null,
    });

    // Injecte la barre d’outils complète (les boutons sont dans le template)
    // => Quill associe automatiquement la toolbar via container

    // Si une valeur initiale existe, l’injecter
    if (this.value) {
      this.quill.root.innerHTML = this.value;
    }

    // Propager les changements
    this.quill.on("text-change", () => {
      const html = this.quill.root.innerHTML;
      this.onChange(html);
      this.valueChange.emit(html);
    });

    // Propager "touched"
    this.quill.on("selection-change", (range) => {
      if (!range) this.onTouched();
    });

    // Gérer disabled state
    if (this.isDisabled) {
      this.quill.disable();
    }
  }

  // ControlValueAccessor
  writeValue(value: any): void {
    this.value = value ?? "";
    if (this.quill) {
      const sel = this.quill.getSelection();
      this.quill.root.innerHTML = this.value as string;
      // Restaure la sélection si besoin
      if (sel) this.quill.setSelection(sel);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (this.quill) {
      isDisabled ? this.quill.disable() : this.quill.enable();
    }
  }

  ngOnDestroy(): void {
    // Quill n'a pas de destroy officiel, on nettoie la référence
    // et laisse Angular retirer le DOM.
    // (Si tu ajoutes des listeners custom, pense à les retirer ici)
  }
}
